import User from "../models/user.model";
import asyncHandler from "../utils/AsyncHandler";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import bcrypt from "bcryptjs";
import Folder from "../models/folder.model";

const setLockerPin = asyncHandler(async (req, res) => {
    try {
        const {pin} = req.body;
        const userId = req.user._id;
    
        if(!pin || pin.length < 6)
        {
            throw new ApiError(401, "Pin is required to set locker pin");
        }
    
        const hashedPin = await bcrypt.hash(pin, 10);
        await User.findByIdAndUpdate(userId, { LockerPin: hashedPin});
    
        res.status(200).json(
            new ApiResponse(200, "Locker pin set successfully", {userId, pin: hashedPin})
        )
} catch (error) {
    throw new ApiError(500, "Pin could not be set", error);
}
});

const openLocker = asyncHandler(async(req, res) => {
    try {
        const { pin} = req.body;
        const userId = req.user._id;

        if(!pin) throw new ApiError(401, "Pin is required to open locker");

        res.status(200).json(
            new ApiResponse(200, "Got Locker Pin successfully", {userId, pin})
        )
    } catch (error) {
        throw new ApiError(500, "Failed to open locker", error);
    }
})

 const uploadToLocker = asyncHandler(async (req, res) => {try {
    
     const userId = req.user._id;
   
     // 1. Check/verify locker folder
     let lockerFolder = await Folder.findOne({ userId, isLocker: true });
   
     if (!lockerFolder) {
       lockerFolder = await Folder.create({
         name: "Locker",
         userId,
         isLocker: true,
       });
     }
   
     // 2. Handle file (use your multer or local disk logic)
     const file = req.file; // assuming multer sets req.file
   
     if (!file) {
       throw new ApiError(400, "No file uploaded");
     }
   
     // 3. Create DB entry
     const savedFile = await File.create({
       userId,
       folderId: lockerFolder._id,
       name: file.originalname,
       path: file.path, // path to the uploaded file
       mimeType: file.mimetype,
       size: file.size,
       isSecure: true, // important flag
     });
   
     res.status(201).json(
       new ApiResponse(201, "File uploaded to locker successfully", {
         file: savedFile,
       })
     );
 } catch (error) {
     throw new ApiError(500, `Failed to upload file to locker: ${error.message}`);
   }
});

const getLockerFiles = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const LockerFolder = await Folder.findOne({ userId, isLocker: true});

        if(!LockerFolder) throw new ApiError(404, "Failed to find locker folder");

        const lockerFiles = await Folder.find({ userId, parentId: LockerFolder._id})

        res.status(200).json(
            new ApiResponse(200, "Locker files retrieved successfully", {lockerFiles})
        )

    }
    catch(error){
        throw new ApiError(500, "Failed to get locker files", error);
    }
})



module.exports = {
    setLockerPin,
    uploadToLocker,
    getLockerFiles,
    openLocker,
};
