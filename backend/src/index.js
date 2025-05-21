import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';

// dotenv path configure
dotenv.config({
    path: "./.env"
})

// port
const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    // Listen server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection error: ", err);
})