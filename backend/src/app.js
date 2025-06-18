import express from 'express';
import cors from 'cors';
import { ApiError } from './utils/ApiError.js';

const app = express()

//Cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        Credential: true
    })
)

// Common middlewares
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({limit: '16kb', extended: true}))
app.use(express.static('public'))

// IMPORTING ROUTES
import userRouter from "./routes/user.routes.js";
import docketFormRouter from "./routes/docketForm.routes.js";

// ROUTES
app.use("/api/v1/users", userRouter)
app.use("/api/v1/dockets", docketFormRouter)

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // For ApiError instances, statusCode and message are already set.
    // For other errors, log them for debugging and potentially mask details in production.
    if (!(err instanceof ApiError)) {
        console.error("UNHANDLED SERVER ERROR:", err);
        if (process.env.NODE_ENV === 'production' && statusCode === 500) {
            message = "An unexpected error occurred on the server.";
        }
    }

    return res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || [], // Include errors array if present in ApiError
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Optional: stack in dev
    });
});

export { app }