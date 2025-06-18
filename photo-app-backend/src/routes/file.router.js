import express from 'express';
import { Router } from 'express'; 
import {uploadFile, getFiles, downloadFile, generateShareLink, accessSharedFile} from '../controllers/file.controller.js';
import {uploadFolder, folderDownload,  generateFolderShareLink, accessSharedFolder,} from '../controllers/folder.controller.js';
import verifyToken from '../middleware/auth.middlewear.js';
import { uploadS3 } from '../middleware/middlewear.multer';


const fileRouter = Router();

// file routes
fileRouter.route('/upload', verifyToken , uploadS3. fields
    ([
        { 
            name:"file",
            maxCount: 10
        }
    ])

).post(uploadFile);


fileRouter.route('/files').get(verifyToken, getFiles);
fileRouter.route("/download/:field").get(verifyToken, downloadFile)
fileRouter.post("/file/share/:fileId", verifyToken, generateShareLink);
fileRouter.get("/share/:shareId", accessSharedFile);



//folder routes
fileRouter.route('/folder').post(verifyToken,
    uploadS3.fields
    ([
        { 
            name: 'folder', 
            maxCount: 10 
        }
    ]),

    uploadFolder);

fileRouter.get("/download/:folderId", verifyToken, folderDownload);
fileRouter.post("/folder/share/:folderId", verifyToken, generateFolderShareLink);
fileRouter.get("/share-folder/:shareId", accessSharedFolder);

export default fileRouter;