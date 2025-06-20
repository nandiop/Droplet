import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    }


));

app.use(cookieParser());
app.use(express.json({limit:"20kb"})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit:"20kb" })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory

// Import routes
import router from "./routes/auth.router.js";
import fileRouter from "./routes/file.router.js";
import starredRouter from "./routes/starred.router.js";
import trashRouter from "./routes/trash.router.js";
import activityRouter from "./routes/activity.router.js";


app.use("/api/v1/user", router); // htttp//localhost:5000/api/v1/user/register
app.use("/api/v1/file", fileRouter); // http://localhost:5000/api/v1/file/upload
app.use("/api/v1/is-starred", starredRouter);
app.use("api/v1/trash",trashRouter)
app.use("/api/v1/activity", activityRouter)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    
    // Handle Multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: err.message,
            error: err.code
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    return res.status(statusCode).json({
        success: false,
        message,
        error: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export default app;