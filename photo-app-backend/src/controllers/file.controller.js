import File from "../models/files.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";
import Folder from "../models/folder.model";
import { configDotenv } from "dotenv";
import fs from "fs";
import { v4 as uuid4 } from "uuid";

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
});

const getFiles = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { folderId } = req.query;

    // Find files by userId and optionally by folderId
    const query = { userId };
    if (folderId) {
      query.FolderId = folderId;
    }

    const files = await File.find({ userId, folderId: folderId || null });

    res.status(200).json(
      new ApiResponse(200, "Files retrieved successfully", {
        files,
      })
    );
  } catch (error) {
    throw new ApiError(500, `Failed to retrieve files: ${error.message}`);
  }
});

const downloadFile = asyncHandler(async (req, res) => {
  try {
    const { fields } = req.params;
    const userId = req.user._id;
    const fileDoc = await File.findOne({ _id: fields, userId });

    if (!fileDoc) {
      throw new ApiError(404, "File not found!");
    }

    const filePath = path.resolve(fileDoc.path);

    if (!fs.existsSync(filePath)) {
      throw new ApiError(401, "File not found on server!");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Files Downloaded Successfully!"))
      .download(filePath, fileDoc.name, (err) => {
        if (err) {
          throw new ApiError(500, "Error downloading File!");
        }
      });
  } catch (error) {
    throw new ApiError(500, `Failed to download files: ${error.message} `);
  }
});

const generateShareLink = asyncHandler(async (req, res) => {try {
    
      const { fieldId } = req.params;
      const { mode = "restricted", expiresInHours = null } = req.body;
      const userId = req.user._id;
    
      const file = await File.findOne({ _id: fieldId, userId });
    
      if (!file) {
        throw new ApiError(404, "File not found!");
      }
    
      const shareId = uuid4();
      const expiresAt = expiresInHours
        ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
        : null;
    
      await file.save();
    
      const fullLink = `${process.env.CLIENT_URL}/share/${shareId}`;
    
      res.status(200).json(
        new ApiResponse(200, "Share link created", {
          link: fullLink,
          mode,
          expiresAt,
        })
      );
} catch (error) {
     throw new ApiError(500, "Something went wrong")
}
});

const accessSharedFile = asyncHandler(async (req, res) => {try {
    
      const { shareId } = req.params;
      const user = req.user;
    
      const file = await File.findOne({ shareLink: shareId });
    
      if (!file) {
        throw new ApiError(404, "Shared file not found!");
      }
    
      if (file.expiresAt && new Date() > file.expiresAt) {
        throw new ApiError(403, "This link has expired");
      }
    
      if (file.shareMode === "restricted") {
        if (!user || String(user._id) !== String(file.userId)) {
          throw new ApiError(401, "You are not authorized to access this file");
        }
      }
    
      const filePath = file.path;
      res.download(filePath, file.name);
} catch (error) {
    throw new ApiError(500, "Something went wrong")
}
});

module.exports = {
  uploadFile,
  getFiles,
  downloadFile,
  generateShareLink,
  accessSharedFile,
};
