import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./db/index.js"; // Import the connectDB function from the db module


dotenv.config({
    path: "./env" 
    });

connectDB(); // Connect to the database

const app = express(); // Create an Express application
const PORT = process.env.PORT || 5000; // Set the port from environment variables or default to 5000p

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); // Start the server and listen on the specified port