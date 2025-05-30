
import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        index: true
    },
    consignor: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
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