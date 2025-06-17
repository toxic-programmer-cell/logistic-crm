import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createFullDocketEntry, deleteDocketEntry, getAllDockets, getDocketById, getSingleDocket, updateFullDocketEntry } from "../controllers/docketForms.controller.js";

const router = Router();

router.use(verifyJWT); // Apply JWT verification middleware to all routes in this router

router.route("/")
.post(createFullDocketEntry)  //Create Docket
.get(getAllDockets);  //Get all Dockets

router.route("/lookup/:identifier")
.get(getSingleDocket);  // Get a single Docket by identifier

router.route("/:docketId")
.get(getDocketById)
.patch(updateFullDocketEntry)  // Update a Docket by ID
.delete(deleteDocketEntry);  // Delete a Docket by ID

export default router;