import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadAvatarImage from "../utils/cloudinary";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import crypto from "crypto";
import { send } from "process";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import { use } from "react";


const generateAcceccAndRefreshTokens = async(userId) => {
    try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Error generating tokens");
       }
}


const register  = asyncHandler(async (req, res) => {

    const{ username, email, password, fullname, avatar } = req.body;

    if([ username, email, password, fullname ].some(field => !field)) {
        throw new ApiError(400, "All fields are required");
    }

    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();

    //Check if user already exists
    const existinfgUser = await User.findOne({
        $or: [
            { username: normalizedUsername },
            { email: normalizedEmail }
        ]
    });

    if(existinfgUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    // Handle avatar upload
    const avatarFile = req?.files?.avatar?.[0]?.path;
    if(!avatarFile) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatarUploadResult = await uploadAvatarImage(avatarFile);

    if(!avatarUploadResult?.url) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
    // verification token generation
    // Generate a verification token and expiry
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const newUser = new User({
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        fullname,
        avatar: avatarUploadResult.url,
        verificationToken,
        verificationTokenExpiry

    });

    //send verification email

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail({
        to: newUser.email,
        name: newUser.fullname,
        subject: "Verify your email",
        text: `Click the link to verify your email: ${verificationLink}`,
    });


    //Remove password and refreshToken from the response
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }   

    return res.status(201).json(
        new ApiResponse(201, "User created successfully")
    );
})


const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if(!token) {
        throw new ApiError(400, "Verification token is required");
    }

    const user = await User.findOne({ 
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() } // Check if token is still valid
    }); 

    if(!user) {
        throw new ApiError(400, "Invalid or expired verification token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200,"Email Verified Successfully",{
            user:{
                _id: user._id,
                email: user.email,
                fullname: user.fullname,    
                username: user.username,
                isVerified: user.isVerified,
            }
        })
    )
})

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
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
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
    verifyEmail,
}
