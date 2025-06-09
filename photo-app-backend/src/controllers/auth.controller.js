import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadAvatarImage from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import crypto from "crypto";



const generateAcceccAndRefreshTokens = async(userId) => {
    try{    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Error generating tokens");
       }
}


const register = asyncHandler(async (req, res) => {
  console.log("Register request body:", req.body);
  console.log("Register request files:", req.files);
  
  const { username, email, password, fullname } = req.body;

  // Validate required fields
  if (!username || !email || !password || !fullname) {
    throw new ApiError(400, "Username, email, password, and fullname are required");
  }

  // Validate file upload
  if (!req.files || !req.files.avatar || !req.files.avatar[0]) {
    throw new ApiError(400, "Avatar image is required. Please upload an image file.");
  }

  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
  });

  if (existingUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  // Handle avatar upload
  const avatarFile = req?.files?.avatar?.[0]?.path;
  if (!avatarFile) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatarUploadResult = await uploadAvatarImage(avatarFile);

  if (!avatarUploadResult?.url) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // Generate email verification token
  

  const newUser = new User({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    fullname,
    avatar: avatarUploadResult.url,
  });

  await newUser.save(); // ✅ Save to DB
  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully. Please verify your email."));
});


const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        throw new ApiError(401, "Email and password are required");
    }
    const user = await User.findOne({
        $or:[{email}]
    })

    if(!user)
    {
        throw new ApiError(401,"Email id doesnot exists!")
    }    const isPasswordValid = await user.matchPassword(password);
    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAcceccAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json(
            new ApiResponse(200, "Login successful", {
                user: loggedInUser,
                accessToken
            },"Login successful")
        );
})


export {
    register,
    login,
}
