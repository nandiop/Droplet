import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    size:{
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    FolderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },
});

const File = mongoose.model("File", fileSchema);
export default File;