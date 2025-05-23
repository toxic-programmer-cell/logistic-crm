import jwt from 'jsonwebtoken';
import { User } from '../models/users.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken || !decodedToken._id) {
            throw new ApiError(401, "Invalid Access Token: Malformed token");
        }

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            // This case could happen if the user was deleted after the token was issued
            throw new ApiError(401, "Invalid Access Token: User not found");
        }

        if (!user.isActive) {
            throw new ApiError(403, "User account is inactive. Please contact admin.");
        }

        req.user = user; // Attach user to the request object
        next();
    } catch (error) {
        // Handle specific JWT errors or re-throw as ApiError
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, error?.message || "Invalid Access Token");
        }
        // If it's already an ApiError, re-throw it
        if (error instanceof ApiError) {
            throw error;
        }
        // For other unexpected errors
        throw new ApiError(401, "Invalid Access Token or unauthorized request");
    }
});