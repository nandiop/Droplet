import User from "../models/user.model";
import ApiError from "../utils/ApiError";
import asyncHandler from "../utils/AsyncHandler";
import jwt from "jsonwebtoken";

const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) {
            throw new ApiError(401, "Access token is required");
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user) {
            throw new ApiError(404, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Access Token");
        
    }

});

export default verifyToken;