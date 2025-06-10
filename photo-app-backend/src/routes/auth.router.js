import { Router } from "express";
import multer from "multer";
import { register, login, getCurrentUser } from "../controllers/auth.controller.js";
import { upload } from "../middleware/middlewear.multer.js";
import verifyToken from "../middleware/auth.middlewear.js";
import { uploadFile , getFiles} from "../controllers/file.controller.js";
import uploadFolder from "../controllers/folder.controller.js";
import { uploadS3 } from "../middleware/middlewear.multer.js";

const router = Router();

router.route("/register").post(
  (req, res, next) => {
    console.log("Request headers:", req.headers);
    console.log("Request files before multer:", req.files);
    
    const uploadMiddleware = upload.fields([
      { name: 'avatar', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`
        });
      } else if (err) {
        console.error("Unknown error:", err);
        return res.status(500).json({
          success: false,
          message: `Unknown error: ${err.message}`
        });
      }

      // Log the files after multer processing
      console.log("Request files after multer:", req.files);
      console.log("Request body after multer:", req.body);

      if (!req.files?.avatar?.[0]) {
        return res.status(400).json({
          success: false,
          message: "Avatar file is required"
        });
      }

      next();
    });
  },
  register
);

router.route("/login").post(login); // ✅ No token required here
router.route("/current-user").get(verifyToken,getCurrentUser);


router.route("/upload-file").post(verifyToken,
  uploadS3.single("file"),
  uploadFile
); // ✅ Token required

router.route("/upload-folder").post(verifyToken, 
  uploadS3.single("folder"), 
  uploadFolder); // ✅ Token required

  router.route("/get-files").get(verifyToken, getFiles)


export default router;
