import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  shareLink: {
    type: String,
    default: null,
  },
  shareMode: {
    type: String,
    enum: ["restricted", "open"],
    default: "restricted",
  },
  expiresAt: {
    type: Date,
    default: null,
  },
    isStarred:{
    type: Boolean,
    default: false
  }
});
const Folder = mongoose.model("Folder", folderSchema);
export default Folder;
