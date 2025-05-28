import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createFullDocketEntry } from "../controllers/docketForms.controller.js";

const router = Router();

router.route("/docket-form").post(verifyJWT, createFullDocketEntry);

export default router;