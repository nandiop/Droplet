import express from "express"

import  {moveToTrash,
    restoreFromTrash,
    getTrashedItems,
    permanentlyDelete
} from "../controllers/trash.controller.js"

import verifyToken from "../middleware/auth.middlewear.js"


const trashRouter = express.Router();


trashRouter.patch("/trash/:type/:id", verifyToken, moveToTrash);
trashRouter.get("/trash", verifyToken, getTrashedItems);
trashRouter.patch("/trash/restore/:type/:id", verifyToken, restoreFromTrash);
trashRouter.delete("/trash/:type/:id", verifyToken, permanentlyDelete);


export default trashRouter