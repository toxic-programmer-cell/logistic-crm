
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{timestamps: true})

export const User = mongoose.model('User', userSchema);