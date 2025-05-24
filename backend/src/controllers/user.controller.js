import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";


// GENERATING ACCESS AND REFRESH TOKENS
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
    
        if (!user) {
            throw new ApiError(404, "User not found")
        }
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        user.save(validateBeforeSave = false)
        return { accessToken, refreshToken }
    } catch (error) {
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

export {
    registerUser
}