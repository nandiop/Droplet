import File from "../models/files.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";
import Folder from "../models/folder.model";
import { configDotenv } from "dotenv";


//uploaded file from front end
const uploadFile = asyncHandler(async (req, res) => {
    try {
        
        const { file } = req;
        const { folderId } = req.body;
        const userId = req.user._id;
        if (!file) {
            throw new ApiError(400, "File is required");
        }
        let filePath;

        //S3 upload

        const fileKey = `${userId}/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        const s3Response = await s3.upload(params).promise();
        filePath = s3Response.Location;

        //Save file metadata to database

        const newFile = new File({
            userId,
            name: file.originalname,
            path: filePath,
            size: file.size,
            createdAt: new Date(),
            mimetype: file.mimetype,
            FolderId: folderId ? folderId : null,
        });

        await newFile.save();
        res.status(201).json(
            new ApiResponse(201, "File uploaded successfully", {
                file: newFile,
            })
        );

    } catch (error) {
        throw new ApiError(500, `File upload failed: ${error.message}`);
    }

})

const getFiles = asyncHandler(async (req, res) => {

    try {
        const userId = req.user._id;
        const { folderId } = req.query;

        // Find files by userId and optionally by folderId
        const query = { userId };
        if (folderId) {
            query.FolderId = folderId;
        }

        const files = await File.find({userId,folderId: folderId || null});

        res.status(200).json(
            new ApiResponse(200, "Files retrieved successfully", {
                files,
            })
        );
    } catch (error) {
        throw new ApiError(500, `Failed to retrieve files: ${error.message}`);
    }
})

module.exports = {
    uploadFile,
    getFiles
};