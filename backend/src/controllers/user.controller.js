import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import mongoose  from "mongoose";
import jwt from "jsonwebtoken";
import { parseExpiry } from "../utils/parseExpiry.js";

const refreshTokenExpiry = parseExpiry(process.env.REFRESH_TOKEN_EXPIRY);
const accessTokenExpiry = parseExpiry(process.env.ACCESS_TOKEN_EXPIRY);

const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'Strict'
        }

// GENERATING ACCESS AND REFRESH TOKENS
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log("USER:",user);
        
    
        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return { accessToken, refreshToken }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error("Token Generation Error Details:", error);
        throw new ApiError(500, "Failed to generate tokens due to an internal server error.");
    }
}

// NOTE: REGISTERING A NEW USER
const registerUser = asyncHandler( async (req, res) => {
    const { fullName, username, phoneNumber, email, password, role } = req.body

    // ADMIN ROLE CHECK
    if (req.user.role !== 'ADMIN') {
        throw new ApiError(403, 'Only admin can register new users');
    }

    // VALIDATION
    if ([fullName, username, phoneNumber, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required');
    }
    //role validation
    if (role && !['ADMIN', 'USER'].includes(role.toUpperCase())) {
        throw new ApiError(400, "Invalid role specified. Allowed roles are 'ADMIN' or 'USER'.");
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    // CHECKING IF THE USER ALREADY EXISTS
    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    // NEW USER CREATION
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        phoneNumber,
        email,
        password,
        role: role ? role.toUpperCase() : 'USER'
    })

    // feild not to be returned
    const newUser = await User.findById(user._id).select("-password -refreshToken")

    // console.log("New User Created: ", newUser);
    

    // CHECKING IF THE USER IS CREATED
    if (!newUser) {
        throw new ApiError(500, "Failed to create a new user");
    }

    return res
    .status(201)
    .json( new ApiResponse(201, newUser, "New User created Successfully"))
})

// LOGINUSER CONTROLLER
const loginUser = asyncHandler( async (req, res) => {
    try {
        const {email, password} = req.body
    
        if ([email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Email and password are required")
        }
    
        const user = await User.findOne({email})
    
        if (!user) {
            throw new ApiError(404, "User not found")
        }
    
        const isPasswordValid = await user.isPasswordCorrect(password)
    
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid email or password")  
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    
        // Send refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, { ...option, maxAge: refreshTokenExpiry});
        res.cookie('accessToken', accessToken, { ...option, maxAge: accessTokenExpiry});

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {user: loggedInUser},
                "User logged in successfully"
            )
        )
    } catch (error) {
        next(error)
    }

})

// GET CURRENT USER CONTROLLER
const getCurrentUser = asyncHandler(async (req, res) => {
    // req.user is attached by verifyJWT middleware
    if (!req.user) {
        // This case should ideally be caught by verifyJWT itself,
        // but as a safeguard:
        throw new ApiError(401, "User not authenticated");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { user: req.user }, "Current user fetched successfully"));
});

// LOGOUT USER CONTROLLER
const logoutUser = asyncHandler( async (req, res) => {
    if (!req.user || !req.user._id){
        throw new ApiError(401, "Unauthorized access")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )


    return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
} )

// REFRESH ACCESS TOKEN CONTROLLER
const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    try {
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request: Refresh token is missing");
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        if (!decodedToken?._id){
            throw new ApiError(401, "Invalid Refresh Token: Malformed token");
        }
    
        const user = await User.findById(decodedToken._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token: User not found");
        }
    
        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, { ...option, maxAge: refreshTokenExpiry })
            .cookie("accessToken", accessToken, { ...option, maxAge: accessTokenExpiry })
            .json(
                new ApiResponse(
                    200,
                    { },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        // If it's already an ApiError (e.g., from generateAccessAndRefreshToken), re-throw it
        if (error instanceof ApiError) {
            throw error;
        }
        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, error?.message || "Invalid Refresh Token");
        }
        throw new ApiError(500, error.message || "Something went wrong while refreshing access token");
    }
})

const updateUserProfile = asyncHandler( async (req, res) => {
    /**
     * 1. Admin role check
     * 2. Get user ID from request params
     * 3. Get updated user data from request body
     * 4. Prevent password update through this endpoint
     * 5. Validate updated data
     * 6. Check username and email uniqueness
     * 7. Update user profile in the database
     * 8. Return updated user profile
     */
    // Admin role check
    if (req.user.role !== 'ADMIN') {
        throw new ApiError(403, 'Only admin can update user profiles');
    }

    // Get user ID from request params
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    // Get updated user data from request body
    const { fullName, username, phoneNumber, email, role } = req.body;
    
    if (req.body.password) {
        throw new ApiError(400, 'Password update is not allowed through this endpoint');
    }

    // Construct the update object
    const updateFields = {};

    // fullName validation
    if (fullName !== undefined) {
        if (typeof fullName !== 'string' || fullName.trim() === "") {
            throw new ApiError(400, 'Full name is required and must be a string');
        }
        updateFields.fullName = fullName.trim();
    }

    // username validation
    if (username !== undefined) {
        if (typeof username !== 'string' || username.trim() === "") {
            throw new ApiError(400, 'Username is required and must be a string');
        }
        updateFields.username = username.trim().toLowerCase();
    }

    // phoneNumber validation
    if (phoneNumber !== undefined) {
        if (typeof phoneNumber !== 'string' || phoneNumber.trim() === "") {
            throw new ApiError(400, 'Phone number required')
        }
        updateFields.phoneNumber = phoneNumber.trim();
    }

    // email validation
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim() === "") {
            throw new ApiError(400, "Email is required")
        }
        if (!/\S+@\S+\.\S+/.test(email.trim())) {
            throw new ApiError(400, "Invalid email format");
        }
        updateFields.email = email.trim().toLowerCase();
    }

    // role validation
    if (role !== undefined) {
        const roleValue = String(role).toUpperCase();
        if (!['ADMIN', 'USER'].includes(roleValue)) {
            throw new ApiError(400, "Invalid role specified. Allowed roles are 'ADMIN' or 'USER'.");
        }
        updateFields.role = roleValue;
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided for update. Allowed fields: fullName, username, phoneNumber, email, role.");
    }

    // 7. Check for conflicts if username or email are being updated
    const conflictChecks = [];
    if (updateFields.username) conflictChecks.push({ username: updateFields.username, _id: { $ne: userId } });
    if (updateFields.email) conflictChecks.push({ email: updateFields.email, _id: { $ne: userId } });

    if (conflictChecks.length > 0) {
        const existingUserWithConflict = await User.findOne({ $or: conflictChecks });
        if (existingUserWithConflict) {
            throw new ApiError(409, `Update failed: ${updateFields.username && existingUserWithConflict.username === updateFields.username ? `Username '${updateFields.username}'` : `Email '${updateFields.email}'`} is already taken.`);
        }
    }

    // Update user profile in the database
    const updateUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        {
             new: true,
            runValidators: true
        }
    ).select("-password -refreshToken")

    if (!updateUser) {
        throw new ApiError(404, "User update failed: User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updateUser,
            "User profile updated successfully"
        )
    )
})

const deleteuser = asyncHandler( async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        throw new ApiError(403, 'EXCEPTION: --Only admin can delete users--');
    }

    const { userId  } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    if (req.user._id.toString() === userId) {
        throw new ApiError(400, 'EXCEPTION: You cannot delete your own account');
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError(404, 'User not found or already deleted');
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {userId: deletedUser._id},
        "User deleted successfully"
    ))
})

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    updateUserProfile,
    deleteuser
}