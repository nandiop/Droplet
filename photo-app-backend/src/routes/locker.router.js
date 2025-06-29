import express from "express";
import { Router } from "express";
import {compareLockerPin} from "../middleware/middlewear.lockerPin.js";
import { uploadS3 } from "../middleware/middlewear.multer.js";
import verifyToken from "../middleware/auth.middlewear.js";

import {setLockerPin,
    uploadToLocker,
    getLockerFiles,
    openLocker,} from "../controllers/locker.controller.js";

const LockerRouter = Router();

LockerRouter.post("/set-pin", verifyToken, setLockerPin);
LockerRouter.post("/open", verifyToken, compareLockerPin, openLocker);
LockerRouter.post("/upload", verifyToken, compareLockerPin, 
    uploadS3.fields([{
         name: "file", maxCount: 10 
        }]), 
        uploadToLocker);
LockerRouter.get("/files", verifyToken, compareLockerPin, getLockerFiles)

export default LockerRouter;