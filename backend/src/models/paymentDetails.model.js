
import mongoose, { Schema } from "mongoose";

const paymentDetailsSchema = new Schema({
    declaredValue: {
        type: String,
        required: true
    },
    vendor: {
        type: String,
        required: true
    },
    vendorNumber: {
        type: Number,
        required: true
    },
    fwdNetwork: {
        type: String,
        required: true
    },
    fwdNumber: {
        type: Number,
        required: true
    },
    pkts: {
        type: Number,
        required: true
    },
    actualWeight: {
        type: String,
        required: true
    },
    chargeWeight: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    frieghtOn: {
        type: String,
        required: true
    },
    clearence: {
        type: Number,
        required: true
    },
    otherC: {
        type: Number,
        required: true
    },
    gst: {
        type: Schema.Types.ObjectId,
        ref: 'Gst'
    },
    total: {
        type: Number,
        required: true
    }
})

export const PaymentDetail = mongoose.model('PaymentDetail', paymentDetailsSchema);