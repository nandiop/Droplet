import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Upload directory:", uploadDir);
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        console.log("Processing file:", file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    console.log("Checking file:", file);
    if (!file) {
        console.log("No file provided");
        cb(new Error('No file uploaded'), false);
        return;
    }
    
    // Check mime type
    if (file.mimetype.startsWith('image/')) {
        console.log("Valid image file detected:", file.mimetype);
        cb(null, true);
    } else {
        console.log("Invalid file type:", file.mimetype);
        cb(new Error(`Invalid file type. Got ${file.mimetype}, expected image/*`), false);
    }
};

// Export the configured multer middleware
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});