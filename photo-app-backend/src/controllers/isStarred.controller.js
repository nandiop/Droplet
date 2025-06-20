import File from "../models/files.model";
import Folder from "../models/folder.model";
import asyncHandler from "../utils/AsyncHandler";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const toggleStared = asyncHandler(async(req,res) => {
    try {

        const {itemId, type} = req.params;
        const userId = req.user._id;
    
        let item;
    
        if(type === "file")
        {
            item = await File.findOne({_id: itemId, userId})
        }
        else if(type === "folder")
        {
            item - await File.findOne({_id: itemId, userId})
        }
        else{
            throw new ApiError(404, "Invalid type - must be 'file' or 'folder'!")
        }
    
        if(!item)
        {
            throw new ApiError(401, `File ${type} not Found!`)
        }
    
        item.isStarred = !item.isStarred
        await item.save()
    
        res.status(200).json(
            new ApiResponse(201, `${type} ${item.isStarred? "starred" : "unstarred"} sucessfilly!`,{
                item,
            })
        )
} catch (error) {
    throw new ApiError(500, "File or Folder is nor starred!")
}

})

const getStarredItems = asyncHandler(async(req,res) => {
    try {
        const userId = req.user._id

        const starredFile = await File.findOne({userId, isStarred: true})
        const starredFolder = await Folder.findOne({userId, isStarred: true})

        res.status(200).json(
            new ApiResponse(201, "File and Folder fetched Successfully!",
                {
                    files:starredFile,
                    Folder:starredFolder
                }
            )
        )
    } catch (error) {
        throw new ApiError(500, "Starred file or folder fetching is unseccessful!")
    }
})

module.exports = {
    toggleStared,
    getStarredItems
}