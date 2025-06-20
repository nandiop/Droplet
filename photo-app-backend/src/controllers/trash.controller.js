import asyncHandler from "../utils/AsyncHandler";
import File from "../models/files.model";
import Folder from "../models/folder.model";
import ApiError from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const moveToTrash = asyncHandler(async(req, res) => {try {
    
        const {type , id} = req.params
        const userId = req.user._id
    
        let item;
    
    
        if(item === "file")
        {
            item = await File.findOne({ _id:id, userId});
        }
        else if(item === "folder")
        {
            item = await Folder.findOne({ _id:id, userId});
        }
        else{
            throw new ApiError(400, "Invalid Type")
        }
    
        if(!item)
        {
            throw new ApiError(404, `${type} not found`)
        }
    
        item.isTrashed = true;
        item.trashedAt = Date.now()
        await item.save()
    
        res.status(200).json(
            new ApiResponse(200, `${type} moved to trash`, {item})
        )
} catch (error) {
    throw new ApiError(500, "Item is not moved to trash")
}
})

 const getTrashedItems = asyncHandler(async (req, res) => {try {
    
      const userId = req.user._id;
    
      const files = await File.find({ userId, isTrashed: true });
      const folders = await Folder.find({ userId, isTrashed: true });
    
      res.status(200).json(new ApiResponse(200, "Trashed items fetched", { files, folders }));
} catch (error) {
    throw new ApiError(500, "Trashed item frtching unsuccessful")
}
});


const restoreFromTrash = asyncHandler(async(req, res) => {try {
    
        const {type , id} = req.params
        const userId = req.user._id
    
        let item;
    
    
        if(item === "file")
        {
            item = await File.findOne({ _id:id, userId});
        }
        else if(item === "folder")
        {
            item = await Folder.findOne({ _id:id, userId});
        }
    
        if(!item)
        {
            throw new ApiError(404, `${type} not found in trash`)
        }
    
        item.isTrashed = false;
        item.trashedAt = null;
        await item.save()
    
        res.status(200).json(
            new ApiResponse(200, `${type} restored`, {item})
        )
} catch (error) {
    throw new ApiError(500, "Item restoring unsuccesful!")
}
});

 const permanentlyDelete = asyncHandler(async (req, res) => {try {
    
     const { type, id } = req.params;
     const userId = req.user._id;
   
     let item;
   
     if (type === "file") {
       item = await File.findOne({ _id: id, userId });
       if (item) {
         // Optional: fs.unlinkSync(item.path); to delete from disk
         await item.deleteOne();
       }
     } else if (type === "folder") {
       item = await Folder.findOne({ _id: id, userId });
       if (item) {
         await item.deleteOne();
         // Optional: recursively delete child files/folders
       }
     }
   
     if (!item) throw new ApiError(404, `${type} not found`);
   
     res.status(200).json(new ApiResponse(200, `${type} permanently deleted`));
 } catch (error) {
    throw new ApiError(500, "Item is not parmanently deleted!")
 }
});



modoule.exports = {
    moveToTrash,
    restoreFromTrash,
    getTrashedItems,
    permanentlyDelete
}

