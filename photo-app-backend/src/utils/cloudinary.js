import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import ApiError from "./ApiError.js";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAvatarImage = async (localFilePath) => {
    try {
        if(!localFilePath) {
            throw new ApiError(400, "No file path provided");
        }
        
        console.log("Attempting to upload file:", localFilePath);
        
        if (!fs.existsSync(localFilePath)) {
            throw new ApiError(400, "File does not exist at path: " + localFilePath);
        }
        
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "avatars",
            quality: "auto"
        });
        
        console.log("Cloudinary upload result:", result);
        
        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);
        
        if (!result || !result.secure_url) {
            throw new ApiError(500, "Failed to get upload URL from Cloudinary");
        }
        
        return {
            url: result.secure_url
        };
    } catch (error) {
        console.error("Error in uploadAvatarImage:", error);
        // Clean up the file if it exists and there was an error
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw new ApiError(500, `File upload failed: ${error.message}`);
    }
}

export default uploadAvatarImage;

