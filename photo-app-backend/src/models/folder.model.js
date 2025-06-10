import mongoose from "mongoose";
import { use } from "react";

const folderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});
const Folder = mongoose.model("Folder", folderSchema);
export default Folder;