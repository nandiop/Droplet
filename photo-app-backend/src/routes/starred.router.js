import express from "express"

import {toggleStared,getStarredItems} from "../controllers/isStarred.controller.js"
import verifyToken from "../middleware/auth.middlewear.js"

const starredRouter = express.Router;

starredRouter.patch("/star/:type/:itemId", verifyToken, toggleStared)
starredRouter.get("/starred", verifyToken,getStarredItems)

export default starredRouter;