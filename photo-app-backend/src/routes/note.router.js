import { Router } from "express";
import {
    createNote  ,
    checkGrammer,
    deleteNote,
    getNotes
} from "../controllers/note.controller.js";

import verifyToken from "../middleware/auth.middlewear.js";

const noteRouter = Router();
noteRouter.post("/notes", verifyToken, createNote);
noteRouter.post("/notes/check-grammar", verifyToken, checkGrammer);
noteRouter.get("/notes", verifyToken, getNotes);
noteRouter.delete("/notes/:noteId", verifyToken, deleteNote);

export default noteRouter;