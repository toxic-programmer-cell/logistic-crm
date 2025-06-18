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

// --- Helper function for populating docket details ---
const populateDocketDetails = (query) => {
    return query
        .populate({
            path: 'clientDetails',
            populate: { path: 'reciverClient', model: 'ReciverClient' }
        })
        .populate({
            path: 'paymentDetails',
            populate: { path: 'gst', model: 'Gst' }
        })
        .populate('trackingLog')
        .populate('createdBy', '-password -refreshToken');
};

// --- CREATE Full Docket Entry ---
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

    const validationError = [];

    // --- Basic Validation for Core Data ---
    if (!docketData || !clientData || !paymentDetailData || !gstData) {
        throw new ApiError(400, "Docket, Client, PaymentDetail, and GST data are required.");
    }

    // --- User Authentication Check ---
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated. Cannot create docket entry.");
    }

    // --- Comprehensive Input Validation ---
    // GST Data Validation
    if (!gstData || (gstData.sgst === undefined && gstData.sgst !== 0) || (gstData.cgst === undefined && gstData.cgst !== 0) || (gstData.igst === undefined && gstData.igst !== 0)) {
        throw new ApiError(400, "SGST, CGST, and IGST values are required and must be valid numbers for GST details.");
    }
    // ReciverClient Data Validation (if provided)
    if (reciverClientData && Object.keys(reciverClientData).length > 0) {
        if (!reciverClientData.fullName || !reciverClientData.email || !reciverClientData.phoneNumber || !reciverClientData.address || !reciverClientData.gstNumber || !reciverClientData.conssignee) {
            throw new ApiError(400, "Full name, phone number, address, and GST number are required for Receiver Client if provided.");
        }
    }
    // Client Data Validation
    if (!clientData || !clientData.fullName || !clientData.email || !clientData.phoneNumber || !clientData.address || !clientData.gstNumber || !clientData.consignor) {
        throw new ApiError(400, "Full name, phone number, address, and GST number are required for Client.");
    }
    // PaymentDetail Data Validation
    if (!paymentDetailData) {
        throw new ApiError(400, "PaymentDetail data is required.");
    }
    const requiredPaymentFields = ['declaredValue', 'vendor', 'vendorNumber', 'fwdNetwork', 'fwdNumber', 'pkts', 'actualWeight', 'chargeWeight', 'rate', 'frieghtOn', 'clearence', 'otherC', 'total'];
    for (const field of requiredPaymentFields) {
        const value = paymentDetailData[field];
        const fieldSchema = PaymentDetail.schema.path(field);
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === "")) {
            if (fieldSchema instanceof mongoose.Schema.Types.Number && value === 0) continue;
            throw new ApiError(400, `Field '${field}' is required and cannot be empty for Payment Details.`);
        }
    }
    // Docket Data Validation
    if (!docketData) {
        throw new ApiError(400, "Docket data is required.");
    }
    const requiredDocketFields = ['docketNumber', 'origin', 'destination', 'payType', 'mode', 'packType', 'item', 'docketStatus'];
    for (const field of requiredDocketFields) {
        if (docketData[field] === undefined || docketData[field] === null || docketData[field]?.toString().trim() === "") {
            throw new ApiError(400, `Field '${field}' is required and cannot be empty for Docket Details.`);
        }
    }

    let newGst, newReciverClient, newClient, newPaymentDetail, newBranch, newTrackingLog, newDocket;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        newGst = await Gst.create([gstData], { session });
        newGst = newGst[0];

        if (reciverClientData && Object.keys(reciverClientData).length > 0) {
            newReciverClient = await ReciverClient.create([reciverClientData], { session });
            newReciverClient = newReciverClient[0];
        }

        const clientPayload = { ...clientData };
        if (newReciverClient) {
            clientPayload.reciverClient = newReciverClient._id;
        }
        newClient = await Client.create([clientPayload], { session });
        newClient = newClient[0];

        const paymentDetailPayload = { ...paymentDetailData, gst: newGst._id };
        newPaymentDetail = await PaymentDetail.create([paymentDetailPayload], { session });
        newPaymentDetail = newPaymentDetail[0];

        if (branchData && branchData.name) {
            newBranch = await Branch.create([branchData], { session });
            newBranch = newBranch[0];
        }

        if (trackingLogData && trackingLogData.status && trackingLogData.location) {
            newTrackingLog = await TrackingLog.create([trackingLogData], { session });
            newTrackingLog = newTrackingLog[0];
        }

        const docketPayload = {
            ...docketData,
            clientDetails: newClient._id,
            paymentDetails: newPaymentDetail._id,
            createdBy: userId,
            date: docketData.date ? new Date(docketData.date) : new Date(),
        };
        if (newTrackingLog) {
            docketPayload.trackingLog = newTrackingLog._id;
        }
        newDocket = await Docket.create([docketPayload], { session });
        // DEBUG
        // if (!newDocket || newDocket.length === 0) {
        //     throw new ApiError(500, "Failed to create Docket during transaction.");
        // }

        newDocket = newDocket[0];

        await session.commitTransaction();

        const populatedDocket = await populateDocketDetails(Docket.findById(newDocket._id)).lean();
        if (!populatedDocket) {
            // console.log('issue here');
            
             throw new ApiError(500, "Docket created but failed to retrieve for response.");
        }

        const createdData = {
            docket: populatedDocket,
            client: newClient.toObject(),
            paymentDetail: newPaymentDetail.toObject(),
            gst: newGst.toObject(),
            ...(newReciverClient && { reciverClient: newReciverClient.toObject() }),
            ...(newBranch && { branch: newBranch.toObject() }),
            ...(newTrackingLog && { trackingLog: newTrackingLog.toObject() }),
        };

        return res.status(201).json(
            new ApiResponse(201, createdData, "Docket entry and associated details created successfully.")
        );

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Error during createFullDocketEntry:", error);
        if (error instanceof ApiError){
            throw error;
        } 
        
        if (error.name === 'ValidationError') { // Mongoose validation error
            // Extract a more user-friendly message from Mongoose's verbose error object
            const messages = Object.values(error.errors).map(val => val.message);
            const errorMessage = messages.join(', ');
            throw new ApiError(400, `Validation Failed: ${errorMessage || "Please check your input."}`);
        }

        if (error.name === 'MongoServerError' && error.code === 11000) {
            let conflictingField = "Unknown field";
            let conflictingValue = "Unknown value";
            if (error.keyValue) {
                conflictingField = Object.keys(error.keyValue)[0];
                conflictingValue = error.keyValue[conflictingField];
            }
            
            let modelMessage = "An entry";
            // Make messages more specific based on collection name from error
            if (error.message.includes('reciverclients')) {
                modelMessage = "Receiver client";
                conflictingField = 'email'; // Standardize for known unique fields
            } else if (error.message.includes('clients')) {
                modelMessage = "Client";
                conflictingField = 'email'; // Assuming email is unique here too
            } else if (error.message.includes('dockets') && conflictingField === 'docketNumber') {
                modelMessage = "Docket";
            }

            throw new ApiError(409, `${modelMessage} with this ${conflictingField} ('${conflictingValue}') already exists.`);
        }

        throw new ApiError(500, error.message || "Failed to create docket entry. An unexpected error occurred. Transaction rolled back.");
    } finally {
        session.endSession();
    }
});

// --- READ All Dockets ---
const getAllDockets = asyncHandler(async (req, res) => {
    // TODO: Add pagination, filtering, sorting options
    const dockets = await populateDocketDetails(Docket.find({})).sort({ createdAt: -1 }).lean();

    if (!dockets || dockets.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No dockets found."));
    }

    return res.status(200).json(
        new ApiResponse(200, dockets, "Dockets retrieved successfully.")
    );
});

// --- READ Single Docket by ID ---
const getDocketById = asyncHandler(async (req, res) => {
    const { docketId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(docketId)) {
        throw new ApiError(400, "Invalid Docket ID format.");
    }

    const docket = await populateDocketDetails(Docket.findById(docketId)).lean();

    if (!docket) {
        throw new ApiError(404, `Docket not found with ID: ${docketId}`);
    }

    return res.status(200).json(
        new ApiResponse(200, docket, "Docket retrieved successfully by ID.")
    );
});

// --- READ Single Docket by Docket Number, email, vender, client phone number---
const getSingleDocket = asyncHandler(async (req, res) => {
    // console.log("docketrunning");
    
    // Take [docketNumber || email || phoneNumber || vender] as identifier
    const { identifier } = req.params;

    if (!identifier || typeof identifier !== 'string' || identifier.trim() === ''){
        throw new ApiError(400, "Docket identifier is required and must be a non-empty string.");
    }

    const searchTerm = identifier.trim();
    const orCondition = [];

    // Condition 1: Match by docketNumber
    orCondition.push({ docketNumber: searchTerm });

    // Condition 2: Match by client email
    const clientByEmail = await Client.find({ email: searchTerm }).select('_id').lean();
    if (clientByEmail.length > 0) {
        orCondition.push({ clientDetails: { $in: clientByEmail.map(c => c._id)} });
    }

    // Condition 3: Match by client phoneNumber
    const numericSearchTerm = Number(searchTerm);
    if (!isNaN(numericSearchTerm)) {
        const clientsByPhone = await Client.find({ phoneNumber: numericSearchTerm }).select('_id').lean();
        if (clientsByPhone.length > 0) {
            orCondition.push({ clientDetails: { $in: clientsByPhone.map(c => c._id) } });
        }
    }

    // Condition 4: Match by vendor
    const paymentDetailsByVendor = await PaymentDetail.find({ vendor: searchTerm }).select('_id').lean();
    if (paymentDetailsByVendor.length > 0) {
        orCondition.push({ paymentDetails: { $in: paymentDetailsByVendor.map(pd => pd._id) } });
    }

    let query = {};
    if (orCondition.length > 0) {
        query = { $or: orCondition }
    } else {
        throw new ApiError(404, `No dockets found matching identifier "${searchTerm}".`)
    }

    const docket = await populateDocketDetails(Docket.findOne(query)).lean();

    if (!docket) {
        throw new ApiError(404, `Docket not found for identifier '${searchTerm}'.`)
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            docket,
            "Docket retrieved successfully."
        )
    )
});

// --- UPDATE Full Docket Entry ---
const updateFullDocketEntry = asyncHandler(async (req, res) => {
    const { docketId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(docketId)) {
        throw new ApiError(400, "Invalid Docket ID format.");
    }

    const {
        reciverClientData,
        gstData,
        paymentDetailData,
        clientData,
        docketData,
        // branchData, // Branch updates are typically handled separately
        trackingLogData
    } = req.body;

    if (Object.keys(req.body).length === 0) {
        throw new ApiError(400, "No data provided for update.");
    }
    
    const userId = req.user?._id; // For tracking who updated, if needed in docket schema

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingDocket = await Docket.findById(docketId).session(session);
        if (!existingDocket) {
            throw new ApiError(404, "Docket not found for update.");
        }

        // 1. Update Gst (if gstData provided)
        if (gstData && Object.keys(gstData).length > 0) {
            const paymentDetail = await PaymentDetail.findById(existingDocket.paymentDetails).session(session);
            if (!paymentDetail || !paymentDetail.gst) {
                throw new ApiError(404, "Associated PaymentDetail or GST record not found for update.");
            }
            await Gst.findByIdAndUpdate(paymentDetail.gst, gstData, { new: true, runValidators: true, session });
        }

        // 2. Update/Create ReciverClient (if reciverClientData provided)
        let clientToUpdate = await Client.findById(existingDocket.clientDetails).session(session);
        if (!clientToUpdate) {
            throw new ApiError(404, "Associated Client record not found for update.");
        }
        if (reciverClientData && Object.keys(reciverClientData).length > 0) {
            if (clientToUpdate.reciverClient) {
                await ReciverClient.findByIdAndUpdate(clientToUpdate.reciverClient, reciverClientData, { new: true, runValidators: true, session });
            } else {
                const newReciver = await ReciverClient.create([reciverClientData], { session });
                clientToUpdate.reciverClient = newReciver[0]._id;
                // clientToUpdate will be saved later or as part of clientData update
            }
        }

        // 3. Update Client (if clientData provided)
        if (clientData && Object.keys(clientData).length > 0) {
            // Ensure reciverClient _id from previous step is included if clientData doesn't explicitly set it
            const clientUpdatePayload = { ...clientData };
            if (clientToUpdate.reciverClient && !clientData.reciverClient) {
                 clientUpdatePayload.reciverClient = clientToUpdate.reciverClient;
            }
            clientToUpdate = await Client.findByIdAndUpdate(existingDocket.clientDetails, clientUpdatePayload, { new: true, runValidators: true, session });
        } else if (clientToUpdate.isModified('reciverClient')) { // Save client if only reciverClient was added
            await clientToUpdate.save({ session });
        }


        // 4. Update PaymentDetail (if paymentDetailData provided)
        if (paymentDetailData && Object.keys(paymentDetailData).length > 0) {
            // gst field in paymentDetailData should not be updated directly here, it's handled by gstData
            const { gst, ...restOfPaymentDetailData } = paymentDetailData;
            await PaymentDetail.findByIdAndUpdate(existingDocket.paymentDetails, restOfPaymentDetailData, { new: true, runValidators: true, session });
        }

        // 5. Update/Create TrackingLog (if trackingLogData provided)
        if (trackingLogData && Object.keys(trackingLogData).length > 0) {
            if (existingDocket.trackingLog) {
                await TrackingLog.findByIdAndUpdate(existingDocket.trackingLog, trackingLogData, { new: true, runValidators: true, session });
            } else {
                const newLog = await TrackingLog.create([trackingLogData], { session });
                existingDocket.trackingLog = newLog[0]._id;
                 // existingDocket will be saved later or as part of docketData update
            }
        }
        
        // 6. Update Docket (if docketData provided)
        if (docketData && Object.keys(docketData).length > 0) {
            // Ensure trackingLog _id from previous step is included if docketData doesn't explicitly set it
            const docketUpdatePayload = { ...docketData };
            if (existingDocket.trackingLog && !docketData.trackingLog && (trackingLogData && Object.keys(trackingLogData).length > 0) ) {
                 docketUpdatePayload.trackingLog = existingDocket.trackingLog;
            }
            if (userId) docketUpdatePayload.updatedBy = userId; // Optional: track updater
            if (docketData.date) docketUpdatePayload.date = new Date(docketData.date);

            await Docket.findByIdAndUpdate(docketId, docketUpdatePayload, { new: true, runValidators: true, session });
        } else if (existingDocket.isModified('trackingLog')) { // Save docket if only trackingLog was added
            await existingDocket.save({session});
        }


        await session.commitTransaction();

        const updatedPopulatedDocket = await populateDocketDetails(Docket.findById(docketId)).lean();
         if (!updatedPopulatedDocket) {
             throw new ApiError(500, "Docket updated but failed to retrieve for response.");
        }

        return res.status(200).json(
            new ApiResponse(200, updatedPopulatedDocket, "Docket entry updated successfully.")
        );

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Error during updateFullDocketEntry:", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message || "Failed to update docket entry. Transaction rolled back.");
    } finally {
        session.endSession();
    }
});

// --- DELETE Docket Entry ---
const deleteDocketEntry = asyncHandler(async (req, res) => {
    const { docketId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(docketId)) {
        throw new ApiError(400, "Invalid Docket ID format.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const docketToDelete = await Docket.findById(docketId).session(session);
        if (!docketToDelete) {
            throw new ApiError(404, "Docket not found for deletion.");
        }

        // 1. Delete associated Gst (via PaymentDetail)
        if (docketToDelete.paymentDetails) {
            const paymentDetail = await PaymentDetail.findById(docketToDelete.paymentDetails).session(session);
            if (paymentDetail && paymentDetail.gst) {
                await Gst.findByIdAndDelete(paymentDetail.gst, { session });
            }
            // 2. Delete associated PaymentDetail
            await PaymentDetail.findByIdAndDelete(docketToDelete.paymentDetails, { session });
        }

        // 3. Delete associated TrackingLog
        if (docketToDelete.trackingLog) {
            await TrackingLog.findByIdAndDelete(docketToDelete.trackingLog, { session });
        }

        // 4. Delete the Docket itself
        await Docket.findByIdAndDelete(docketId, { session });

        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(200, { docketId }, "Docket entry and associated details deleted successfully.")
        );

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Error during deleteDocketEntry:", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError(500, error.message || "Failed to delete docket entry. Transaction rolled back.");
    } finally {
        session.endSession();
    }
});


export {
    createFullDocketEntry,
    getAllDockets,
    getSingleDocket,
    updateFullDocketEntry,
    deleteDocketEntry,
    getDocketById
};
