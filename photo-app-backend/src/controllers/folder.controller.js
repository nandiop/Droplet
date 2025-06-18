import archiver from "archiver";
import Folder from "../models/folder.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// Create new folder
const createFolder = asyncHandler(async (req, res) => {try {
    
        const { name, parentId } = req.body;
        const userId = req.user._id;
    
        if (!name || name.trim() === "") {
            throw new ApiError(400, "Folder name is required");
        }
    
        let parentFolder = null;
    
        if (parentId) {
            parentFolder = await Folder.findOne({ _id: parentId, userId });
            if (!parentFolder) {
                throw new ApiError(404, "Parent folder not found or access denied");
            }
        }
    
        const newFolder = new Folder({
            name: name.trim(),
            userId,
            parentId: parentFolder ? parentFolder._id : null,
        });
    
        await newFolder.save();
    
        res.status(201).json(
            new ApiResponse(201, "Folder created successfully", {
                folder: newFolder,
            })
        );
} catch (error) {
    throw new ApiError(500, "Something went Wrong")
}
});


//Recursively fetch all files in folder (with full archive path)

async function getAllFilesInFolder(folderId, userId, currentPath = "") {
  const files = await File.find({ folderId, userId });
  const folders = await Folder.find({ parentId: folderId, userId });

  let fileList = files.map(file => ({
    filePath: file.path,
    archivePath: path.join(currentPath, file.name),
  }));

  for (const subFolder of folders) {
    const subFiles = await getAllFilesInFolder(
      subFolder._id,
      userId,
      path.join(currentPath, subFolder.name)
    );
    fileList = fileList.concat(subFiles);
  }

  return fileList;
}

// Folder Download 
 const folderDownload = asyncHandler(async(req, res) => {try {
    
       const {folderId} = req.params;
       const userId = req.user._id;
   
       const rootFolder = await Folder.findOne({ _id: folderId, userId});
       if(!rootFolder){
           throw new ApiError (404, "Folder not Found!");
       }
       const filesToZip = await getAllFilesInFolder( folderId,userId, rootFolder.name )
       
         res.setHeader("Content-Type", "application/zip");
           res.setHeader("Content-Disposition", `attachment; filename=${rootFolder.name}.zip`);
   
           const archive = archiver("zip", {zlib: { level: 9 }});
           archive.pipe(res)
   
           for( const file of filesToZip)
           {
               if(fs.existsSync(file.filePath))
               {
                   archive.file(file.filePath, {name: file.archivePath });
               }
           }
           archive.finalize();
 } catch (error) {
     throw new ApiError(500, "Something went Wrong")
 }
 })

 const generateFolderShareLink = asyncHandler(async (req, res) => {try {
    
     const { folderId } = req.params;
     const { mode = "restricted", expiresInHours = null } = req.body;
     const userId = req.user._id;
   
     const folder = await Folder.findOne({ _id: folderId, userId });
     if (!folder) throw new ApiError(404, "Folder not found");
   
     const shareId = uuidv4();
     const expiresAt = expiresInHours
       ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
       : null;
   
     folder.shareLink = shareId;
     folder.shareMode = mode;
     folder.expiresAt = expiresAt;
   
     await folder.save();
   
     const fullLink = `${process.env.CLIENT_URL}/share-folder/${shareId}`;
   
     res.status(200).json(
       new ApiResponse(200, "Folder share link created", {
         link: fullLink,
         mode,
         expiresAt,
       })
     );
 } catch (error) {
     throw new ApiError(500, "Something went Wrong")
 }
});

 const accessSharedFolder = asyncHandler(async (req, res) => {try {
    
     const { shareId } = req.params;
     const user = req.user || null;
   
     const folder = await Folder.findOne({ shareLink: shareId });
     if (!folder) throw new ApiError(404, "Shared folder not found");
   
     if (folder.expiresAt && new Date() > folder.expiresAt) {
       throw new ApiError(403, "This link has expired");
     }
   
     if (folder.shareMode === "restricted") {
       if (!user || String(user._id) !== String(folder.userId)) {
         throw new ApiError(401, "Access denied");
       }
     }
   
     const files = await getAllFiles(folder._id, folder.userId, folder.name);
   
     res.setHeader("Content-Type", "application/zip");
     res.setHeader("Content-Disposition", `attachment; filename=${folder.name}.zip`);
   
     const archive = archiver("zip", { zlib: { level: 9 } });
     archive.pipe(res);
   
     for (const file of files) {
       if (fs.existsSync(file.filePath)) {
         archive.file(file.filePath, { name: file.archivePath });
       }
     }
   
     await archive.finalize();
 } catch (error) {
     throw new ApiError(500, "Something went Wrong")
 }
});

export const FolderController = {
    createFolder,
    folderDownload,
    generateFolderShareLink,
    accessSharedFolder
};
