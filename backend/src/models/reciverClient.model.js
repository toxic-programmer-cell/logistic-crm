/*
  _id string pk
  fullName string
  phoneNumber number
  address string
  gstNumber string
*/
import mongoose, { Schema } from "mongoose";

const reciverClientSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    conssignee: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    gstNumber: {
        type: String,
        required: true
    }
})

export const ReciverClient = mongoose.model('ReciverClient', reciverClientSchema);