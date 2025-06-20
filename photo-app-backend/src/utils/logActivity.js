// utils/logActivity.js

import Activity from "../models/activity.model.js";

export const logActivity = async ({
  userId,
  itemId,
  itemType,
  action,
  itemName,
}) => {
  try {
    await Activity.create({
      userId,
      itemId,
      itemType,
      action,
      itemName,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};
