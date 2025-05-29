import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createFullDocketEntry, deleteDocketEntry, getAllDockets, getDocketByDocketNumber, updateFullDocketEntry } from "../controllers/docketForms.controller.js";

const router = Router();

router.use(verifyJWT); // Apply JWT verification middleware to all routes in this router

router.route("/")
.post(createFullDocketEntry)
.get(getAllDockets);

router.route("/by-number/:docket-number")
.get(getDocketByDocketNumber);

router.route("/:docket-id")
.patch(updateFullDocketEntry)
.delete(deleteDocketEntry);

export default router;