import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUIDINARY_NAME,
    api_key: process.env.CLOUIDINARY_API_KEY,
    api_secret: process.env.CLOUIDINARY_API_SECRETE_KEY,
});

const uploadAvatarImage = async (localFilePath) => {

    try {
        if(!localFilePath) {
            throw new Error("No file path provided");
        }    
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect the resource type
        });
        
        fs.unlinkSync(localFilePath); // Delete the local file after upload
        return{result};

    } catch (error) {
        fs.unlinkSync(localFilePath); // Ensure the local file is deleted even if upload fails
        return null;
    }
}

export default uploadAvatarImage;

