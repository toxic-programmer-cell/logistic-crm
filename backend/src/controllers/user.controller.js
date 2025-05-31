import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import mongoose  from "mongoose";
import jwt from "jsonwebtoken";

// update , delete

// GENERATING ACCESS AND REFRESH TOKENS
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        // console.log("USER:",user);
        
    
        if (!user) {
            throw new ApiError(404, "User not found")
        }
    // console.log("User object:", user);
        // console.log("AccessToken secret:", process.env.ACCESS_TOKEN_SECRET);
        // console.log("AccessToken expiry:", process.env.ACCESS_TOKEN_EXPIRY);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // console.log("Access Token:", accessToken);
        // console.log("Refressh Token:", refreshToken);
        
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return { accessToken, refreshToken }
    } catch (error) {
        console.error("Token Generation Error Details:", error);
        throw new ApiError(500, "Failed to generate tokens")
    }
}

// NOTE: REGISTERING A NEW USER
const registerUser = asyncHandler( async (req, res) => {
    const { fullName, username, phoneNumber, email, password, role } = req.body

    if (req.user.role !== 'ADMIN') {
        throw new ApiError(403, 'Only admin can register new users');
    }

    // VALIDATION
    if ([fullName, username, phoneNumber, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required');
    }

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

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, option)
    .cookie("accessToken", accessToken, option)
    .json(
        new ApiResponse(
            200,
            {user: loggedInUser, accessToken, refreshToken},
            "User logged in successfully"
        )
    )

})

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

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    }

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
    const incomingRefreshToken = req.cookie?.refreshToken || req.body?.refreshToken;
    
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
    
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        }
        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, option)
            .cookie("accessToken", accessToken, option)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            throw new ApiError(401, error?.message || "Invalid Refresh Token");
        }
        throw new ApiError(500, "Something went wrong while refreshing access token");
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
        if (typeof fullName !== 'string' || fullName.trim() !== "") {
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

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserProfile
}