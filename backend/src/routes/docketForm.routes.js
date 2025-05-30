import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createFullDocketEntry, deleteDocketEntry, getAllDockets, getSingleDocket, updateFullDocketEntry } from "../controllers/docketForms.controller.js";

const router = Router();

router.use(verifyJWT); // Apply JWT verification middleware to all routes in this router

router.route("/")
.post(createFullDocketEntry)
.get(getAllDockets);

router.route("/lookup/:identifier")
.get(getSingleDocket);

router.route("/:docketId")
.patch(updateFullDocketEntry)

.delete(deleteDocketEntry);

export default router;