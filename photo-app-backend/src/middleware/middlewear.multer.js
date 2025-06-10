import multer from "multer";
import path from "path";
import fs from "fs";
import s3 from "../utils/aws.js"; // Assuming you have an AWS S3 utility set up
import multerS3 from "multer-s3";
import { text } from "stream/consumers";

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

//File filter for S3 uploads
const s3FileFilter = (req, file, cb) => {
    console.log("Checking S3 file:", file);
    if (!file) {
        console.log("No file provided for S3 upload");
        cb(new Error('No file uploaded'), false);
        return;
    }
    
    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
    ];

    if(allowedMimeTypes.includes(file.mimetype)) {
        console.log("Valid S3 file type detected:", file.mimetype);
        cb(null, true);
    }
    else {
        console.log("Invalid S3 file type:", file.mimetype);
        cb(new Error(`Invalid file type for S3 upload. Got ${file.mimetype}, expected one of ${allowedMimeTypes.join(', ')}`), false);
    }
};


// Export the S3 storage configuration for use in other parts of the application
export const uploadS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, `avatars/${file.fieldname}-${uniqueSuffix}${ext}`);
        }
    }),
    fileFilter: s3FileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});
