import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ReciverClient } from "../models/reciverClient.model.js";
import { Gst } from "../models/gst.model.js";
import { PaymentDetail } from "../models/paymentDetails.model.js";
import { Client } from "../models/client.model.js";
import { Docket } from "../models/docket.model.js";
import { Branch } from "../models/branch.model.js";
import { TrackingLog } from "../models/trackingLogs.model.js";
import mongoose from "mongoose";

const createFullDocketEntry = asyncHandler(async (req, res) => {
    const {
        reciverClientData,
        gstData,
        paymentDetailData,
        clientData,
        docketData,
        branchData, // Optional: for creating a new branch entry
        trackingLogData // Optional: for an initial tracking log
    } = req.body;

    // --- Basic Validation for Core Data ---
    if (!docketData || !clientData || !paymentDetailData || !gstData) {
        throw new ApiError(400, "Docket, Client, PaymentDetail, and GST data are required.");
    }

    // --- User Authentication Check (assuming middleware populates req.user) ---
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated. Cannot create docket entry.");
    }

    // --- Start of Creation Process (Consider Mongoose Sessions for transactions in production) ---
    let newGst, newReciverClient, newClient, newPaymentDetail, newBranch, newTrackingLog, newDocket, populatedDocket;

    try {
        // 1. Create Gst (dependency for PaymentDetail)
        if (!gstData.sgst && gstData.sgst !== 0 || !gstData.cgst && gstData.cgst !== 0 || !gstData.igst && gstData.igst !== 0) {
            throw new ApiError(400, "SGST, CGST, and IGST values are required for GST details.");
        }
        newGst = await Gst.create(gstData);

        // 2. Create ReciverClient (optional, dependency for Client)
        if (reciverClientData && Object.keys(reciverClientData).length > 0) {
            if (!reciverClientData.fullName || !reciverClientData.phoneNumber || !reciverClientData.address || !reciverClientData.gstNumber) {
                throw new ApiError(400, "Full name, phone number, address, and GST number are required for Receiver Client if provided.");
            }
            newReciverClient = await ReciverClient.create(reciverClientData);
        }

        // 3. Create Client
        if (!clientData.fullName || !clientData.phoneNumber || !clientData.address || !clientData.gstNumber) {
            throw new ApiError(400, "Full name, phone number, address, and GST number are required for Client.");
        }
        const clientPayload = { ...clientData };
        if (newReciverClient) {
            clientPayload.reciverClient = newReciverClient._id;
        }
        newClient = await Client.create(clientPayload);

        // 4. Create PaymentDetail
        const requiredPaymentFields = ['declaredValue', 'vendor', 'vendorNumber', 'fwdNetwork', 'fwdNumber', 'pkts', 'actualWeight', 'chargeWeight', 'rate', 'frieghtOn', 'clearence', 'otherC', 'total'];
        for (const field of requiredPaymentFields) {
            const value = paymentDetailData[field];
            const fieldSchema = PaymentDetail.schema.path(field);
            if (value === undefined || value === null || (typeof value === 'string' && value.trim() === "")) {
                 if (fieldSchema instanceof mongoose.Schema.Types.Number && value === 0) continue; // Allow 0 for numbers
                throw new ApiError(400, `Field '${field}' is required and cannot be empty for Payment Details.`);
            }
        }
        const paymentDetailPayload = {
            ...paymentDetailData,
            gst: newGst._id
        };
        newPaymentDetail = await PaymentDetail.create(paymentDetailPayload);

        // 5. Create Branch (if data provided)
        // This creates a new branch entry. Docket's origin/destination are strings per schema.
        if (branchData && branchData.name) {
            newBranch = await Branch.create(branchData);
        }

        // 6. Create TrackingLog (if initial log data provided for the docket)
        if (trackingLogData && trackingLogData.status && trackingLogData.location) {
            newTrackingLog = await TrackingLog.create(trackingLogData);
        }

        // 7. Create Docket
        const requiredDocketFields = ['docketNumber', 'origin', 'destination', 'payType', 'mode', 'packType', 'item', 'docketStatus'];
        for (const field of requiredDocketFields) {
           if (docketData[field] === undefined || docketData[field] === null || docketData[field]?.toString().trim() === "") {
               throw new ApiError(400, `Field '${field}' is required and cannot be empty for Docket Details.`);
           }
        }
        const docketPayload = {
            ...docketData,
            clientDetails: newClient._id,
            paymentDetails: newPaymentDetail._id,
            createdBy: userId,
        };
        if (newTrackingLog) {
            docketPayload.trackingLog = newTrackingLog._id;
        }
        if (docketData.date) {
            docketPayload.date = new Date(docketData.date);
        } else {
            // If date is crucial and not provided, you might want to default it or throw error
            // docketPayload.date = new Date(); // Example: default to now if not provided
        }
        newDocket = await Docket.create(docketPayload);

         // --- Populate the newly created docket for a richer response ---
        populatedDocket = await Docket.findById(newDocket._id)
            .populate({
                path: 'clientDetails',
                populate: {
                    path: 'reciverClient', // Populate reciverClient within clientDetails
                    model: 'ReciverClient'
                }
            })
            .populate({
                path: 'paymentDetails',
                populate: {
                    path: 'gst', // Populate gst within paymentDetails
                    model: 'Gst'
                }
            })
            .populate('trackingLog')
            .populate('createdBy', '-password -refreshToken');

    } catch (error) {
        // Basic error handling. In production, you'd implement transaction rollbacks.
        // For now, if an error occurs, previously created documents will remain.
        console.error("Error during combined form creation:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error.message || "Failed to create all docket entries due to an internal error.");
    }

    // --- Prepare response ---
    const createdData = {
        docket: populatedDocket || newDocket,
        client: newClient,
        paymentDetail: newPaymentDetail,
        gst: newGst,
        ...(newReciverClient && { reciverClient: newReciverClient }),
        ...(newBranch && { branch: newBranch }),
        ...(newTrackingLog && { trackingLog: newTrackingLog }),
    };
    console.log("Created Data: ", createdData);

    return res.status(201).json(
        new ApiResponse(201, createdData, "Docket entry and associated details created successfully.")
    );
});

export { createFullDocketEntry };