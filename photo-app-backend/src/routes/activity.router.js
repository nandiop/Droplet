import express from "express";
import { getRecentActivity } from "../controllers/activity.controller.js";

import verifyToken from "../middleware/auth.middlewear.js";

const activityRouter = express.Router();

activityRouter.get("/recent-activity", verifyToken, getRecentActivity);

export default activityRouter;
