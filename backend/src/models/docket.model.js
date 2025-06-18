
import mongoose, { Schema } from "mongoose";

const docketSchema = new Schema({
    docketNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    date: {
        type: Date
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    payType: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true
    },
    packType: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    clientDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    paymentDetails: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentDetail',
        required: true
    },
    docketStatus: {
        type: String,
        required: true,
    },
    trackingLog: {
        type: Schema.Types.ObjectId,
        ref: 'TrackingLog'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})

export const Docket = mongoose.model('Docket', docketSchema)