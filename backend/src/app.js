import express from 'express';
import cors from 'cors';

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

export { app }