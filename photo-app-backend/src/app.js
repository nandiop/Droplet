import express from "express";
import cors from "cors";

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    }


));

app.use(express.json({limit:"20kb"})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit:"20kb" })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory

// Import routes
import router from "./routes/auth.router";
app.use("/api/v1/user", router); // htttp//localhost:5000/api/v1/users/register

export default app;