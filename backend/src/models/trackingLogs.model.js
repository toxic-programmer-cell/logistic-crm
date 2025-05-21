
import mongoose, { Schema } from "mongoose";

const trackingLogSchema = new Schema({
    status: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    remarks: {
        type: String
    }
}, { timestamps: true
})

export const TrackingLog = mongoose.model('TrackingLog', trackingLogSchema);