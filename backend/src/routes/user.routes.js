import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateUserProfile } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(verifyJWT, registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/update-user-profile").put(verifyJWT, updateUserProfile);
router.route("/refresh-token").post(refreshAccessToken);

export default router;