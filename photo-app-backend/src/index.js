import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./db/index.js";
import app from "./app.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({
    path: "./env"
});

// Start server
const server = app.listen(process.env.PORT || 5000, async () => {
    try {
        await connectDB(); // Connect to database
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    } catch (error) {
        console.error("ERROR: ", error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});