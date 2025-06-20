// controllers/activity.controller.js

import Activity from "../models/activity.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const getRecentActivity = asyncHandler(async (req, res) => {try {
    
      const userId = req.user._id;
      const { limit = 50, page = 1 } = req.query;
    
      const activities = await Activity.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
      const total = await Activity.countDocuments({ userId });
    
      res.status(200).json(
        new ApiResponse(200, "Recent activity fetched", {
          activities,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
        })
      );
} catch (error) {
    throw new ApiError(500, "Activity fetching unsuccessfully!")
}
});
