import { Route } from "express";
import { register , login, verifyEmail } from "../controllers/auth.controller.js";
import { upload } from "../middleware/middlewear.multer.js";
import verifyToken from "../middleware/auth.middlewear.js";


const router = Route()

router.route("/register").post(
    upload.fields([{ 
        name: "avatar", 
        maxCount: 1 
    }]),
    register


)

router.route("/login").post(login)
router.route("/verify-email").get(verifyEmail)

export default router;