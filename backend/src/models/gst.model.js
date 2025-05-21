
import mongoose, { Schema } from "mongoose";

const gstSchema = new Schema({
    sgst: {
        type: Number,
        required: true
    },
    cgst: {
        type: Number,
        required: true
    },
    igst: {
        type: Number,
        required: true
    }
})

export const Gst = mongoose.model('Gst', gstSchema);