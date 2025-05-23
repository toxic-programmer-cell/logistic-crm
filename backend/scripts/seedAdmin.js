import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/users.model.js'; // Adjust path if your model is elsewhere
import { DB_NAME } from '../src/constants.js'; // Assuming DB_NAME is exported from constants.js

// Load environment variables from .env file in the backend root
dotenv.config({ path: '../.env' });

const seedAdmin = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error("Error: MONGODB_URI is not defined in the .env file.");
        process.exit(1);
    }

    const dbConnectionUrl = `${MONGODB_URI}/${DB_NAME}`;

    try {
        console.log(`Attempting to connect to database: ${DB_NAME}`);
        await mongoose.connect(dbConnectionUrl);
        console.log("Database connected successfully.");

        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ role: 'ADMIN' });

        if (existingAdmin) {
            console.log("Admin user already exists:");
            console.log(`  Username: ${existingAdmin.username}`);
            console.log(`  Email: ${existingAdmin.email}`);
            return; // Exit if admin already exists
        }

        // --- Define your first admin user's details ---
        // It's highly recommended to use environment variables for these in production
        const adminFullName = process.env.INITIAL_ADMIN_FULLNAME;
        const adminUsername = process.env.INITIAL_ADMIN_USERNAME;
        const adminPhoneNumber = process.env.INITIAL_ADMIN_PHONE;
        const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
        const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

        // if (adminPassword === "AdminPassword123!") {
        //     console.warn("Warning: Using the default admin password. Please change this or set INITIAL_ADMIN_PASSWORD in your .env file for security.");
        // }

        console.log(`Creating initial admin user: ${adminUsername}`);

        // The pre-save hook in your User model will hash the password automatically
        const newAdmin = await User.create({
            fullName: adminFullName,
            username: adminUsername.toLowerCase(),
            phoneNumber: adminPhoneNumber,
            email: adminEmail.toLowerCase(),
            password: adminPassword, // Provide plain password here; model will hash it
            role: 'ADMIN',
            isActive: true // Ensure the admin is active
        });

        console.log("Admin user created successfully:");
        console.log(`  Full Name: ${newAdmin.fullName}`);
        console.log(`  Username: ${newAdmin.username}`);
        console.log(`  Email: ${newAdmin.email}`);
        console.log("You can now log in with this admin user.");

    } catch (error) {
        console.error("Error during admin user seeding:", error);
        if (error.code === 11000) { // Mongoose duplicate key error
            console.error("A user with the specified username or email already exists. If it's not an admin, please resolve the conflict manually or check your INITIAL_ADMIN_USERNAME/INITIAL_ADMIN_EMAIL environment variables.");
        }
        process.exit(1);
    } finally {
        console.log("Disconnecting from database...");
        await mongoose.disconnect();
        console.log("Database disconnected.");
    }
};

seedAdmin();