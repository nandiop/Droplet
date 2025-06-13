import express from 'express';
import { Router } from 'express'; 
import {uploadFile, getFiles} from '../controllers/file.controller.js';
import uploadFolder from '../controllers/folder.controller.js';
import verifyToken from '../middleware/auth.middlewear.js';
import { uploadS3 } from '../middleware/middlewear.multer';

const fileRouter = Router();

fileRouter.route('/upload', verifyToken , uploadS3. fields
    ([
        { 
            name:"file",
            maxCount: 10
        }
    ])

).post(uploadFile);


fileRouter.route('/files').get(verifyToken, getFiles);


fileRouter.route('/folder',).post(verifyToken,
    uploadS3.fields
    ([
        { 
            name: 'folder', 
            maxCount: 10 
        }
    ]),

    uploadFolder);

export default fileRouter;