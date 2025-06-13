import Folder from "../models/folder.model";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";


const createFolder = asyncHandler(async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const userId = req.user._id;
        if (!name) {
            throw new ApiError(400, "Folder name is required");
        }                                                   

        if(parentId){
            const parentFolder = await Folder.findById(parentId);
            if (!parentFolder) {
                throw new ApiError(404, "Parent folder not found");
            }
        }

            //folder metadata
        const newFolder = new Folder({
            name,
            userId,
            parentId: parentId || null,
        });

        await newFolder.save();

        res.status(201).json(
            new ApiResponse(201, "Folder created successfully", {
                folder: newFolder,
            })
        );


    } catch (error) {
        throw new ApiError(500, `Folder creation failed: ${error.message}`);
    }

})


module.exports = {
    createFolder,
};