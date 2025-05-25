import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";


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

    User.findByIdAndUpdate(
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

export {
    registerUser,
    loginUser,
    logoutUser
}