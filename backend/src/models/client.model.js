
import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true
    },
    reciverClient: {
        type: Schema.Types.ObjectId,
        ref: 'ReciverClient'
    }
})

export const Client = mongoose.model('Client', clientSchema);