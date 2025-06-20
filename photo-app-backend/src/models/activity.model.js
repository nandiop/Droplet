// models/activity.model.js

import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    action: {
      type: String,
      enum: ["upload", "delete", "restore", "share", "rename", "move", "download"],
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
