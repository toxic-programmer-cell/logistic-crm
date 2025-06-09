import { Router } from "express";
import { deleteuser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT, registerUser);  //Register a new user
router.route("/login").post(loginUser); //Login an existing user
router.route("/logout").get(verifyJWT, logoutUser);  //Logout a user
router.route("/update-user-profile/:userId").put(verifyJWT, updateUserProfile);  //Update user profile by userId
router.route("/delete-user/:userId").delete(verifyJWT, deleteuser);  //Delete a user by userId
router.route("/refresh-token").post(refreshAccessToken);  //Refresh access token

export default router;