import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {upload} from "../middleware/multer.middleware.js"
import { uploadfilecloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/sendemail.js";

import crypto from 'crypto'
import nodemailer from "nodemailer";
import Token from "../models/token.js";

import { User } from "../models/user.model.js";
import { request } from "express";
const generateRefreshTokenandaccestoken = async(userId)=>{
   try{
   const user= await User.findById(userId)
 const accessToken=  user.generateAccesstoken()
  const refreshToken= user.generateRefreshToken ()
  user.refreshToken = refreshToken
 await user.save({validateBeforeSave:false})
//  console.log("Tokens generated", { accessToken, refreshToken });

 return {accessToken, refreshToken}


   }
   catch(error){
      throw new ApiError(500,"something went wrong while genrating access token")

   }


}
const registerUser = asyncHandler(async(req,res)=>{
 const {username,password,email,fullname}   = req.body
 if(fullname===""){
    throw new ApiError(401,"full name is required")

 }
 else if(password===""){
    throw new ApiError(401,"password is required")

 }
  else if(username===""){
    throw new ApiError(401,"username is required")

 }
  else if(email===""){
    throw new ApiError(401,"email is required")

 }
 else{
 

 const existeduser=await User.findOne({
    $or:[{username},{email}]
})
if(existeduser){
      throw new ApiError(409,"user already exists with this email and username")
}

  
    
 const user=await User.create({
    email,fullname, password,username:username.toLowerCase()

})
const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered Successfully")
    )
 }


 





})

  // login controller
const loginUser = asyncHandler(async(req,res)=>{
 
 const {email,password} = req.body
//  console.log(req.body);
 
 if(!email){
   throw new ApiError(401,"email is required")
 }
 else if(!password){
      throw new ApiError(401,"password is required")

 }
  const user= await User.findOne({email})
  if(!user){
   throw new ApiError(401,"User not found please register")

  }
   const passwordvalidated =await user.isPasswordCorrect(password)
if(!passwordvalidated){
    throw new ApiError(402,"password is incorrect")

}


  const {accessToken, refreshToken}=  await  generateRefreshTokenandaccestoken(user._id)
  // console.log(refreshToken,accessToken);
  
  const loggedinuser = await User.findById(user._id).select("-password -refreshToken");
  const options ={
   httpOnly:true,
   secure:false

  }
  return res.status(200).cookie("accesstoken",accessToken,options).cookie("refreshtoken",refreshToken,options).json(new ApiResponse(200,{
   user:loggedinuser,accessToken,refreshToken
  },"user logged in successfully"))


  
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
  httpOnly: true,
  secure: false, // ✅ For local dev (set to true only on HTTPS)
  sameSite: "lax"
};

    return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new ApiResponse(200, {}, "User logged Out Succesfully"))
})
 
const refreshtoken = asyncHandler(async(req,res)=>{
 const incomingrefreshtoken =  req.cookies.refreshtoken || req.body.refreshtoken
 if(!incomingrefreshtoken){
  throw new ApiError(401,"unauthroized request")
  
 }
 try{
 const decodedtoken =  jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)

 const user =  await User.findById(decodedtoken._id)
 if(!user){

  throw new ApiError(401,"invalid refresh token")
 }
if(incomingrefreshtoken!=user.refreshToken){
  throw new ApiError(401, "Refresh token is expired or used")
}

  const options = {
            httpOnly: true,
            secure: true
        }


         const {accessToken,newRefreshToken} = await generateRefreshTokenandaccestoken(decodedtoken._id)
 
        return res
        .status(200)
        .cookie("accesstoken", accessToken, options)
        .cookie("refreshtoken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
 }


 
 catch(error){
  throw new ApiError(401, error?.message || "Invalid refresh token")

 }


})



const updateProfile= asyncHandler(async(req, res) => {

    const avatarLocalPath = req.files.avatar[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(401,"avatar is required")
    }

  const avatar =   await uploadfilecloudnary(avatarLocalPath);
   const user= await User.findByIdAndUpdate(
    req.user?._id
    ,{
        $set:{
            avatar:avatar.url
        }
    },
    {new:true},


  ).select("-password")
   return res
        .status(200)
        .json(
            new ApiResponse(
                200,user, "ProfileUpdated Succesfully",
               
            )
        )
    
 
})


const deleteaccount= asyncHandler(async(req, res) => {
      const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID not found in token");
  }

  const deleteduser = await  User.findByIdAndDelete(userId)
  if(!deleteduser){
    throw new ApiError(401,"Error in deleting account")
  }
    
  
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "User Deleted Successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    
  
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User Fetched Successfully"))
})
const editProfile = asyncHandler(async (req, res) => {
  const { username, fullname } = req.body;

  if (!username && !fullname) {
    throw new ApiError(400, "At least one field (username or fullname) is required to update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
      username:username,
      fullname:fullname
      },
    },
    { new: true } //  returns updated document
  );

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});
const verifyEmail = asyncHandler(async (req, res) => {
 
   try {
      const user = await User.findById(req.user._id); // comes from verifyJWT middleware
  
      if (!user) return res.status(400).send("User not found");
      if (user.verified) return res.status(400).send("Email already verified");
  
      // Generate token
      const tokenValue = crypto.randomBytes(32).toString("hex");
  
      // Remove old token & save new one
      await Token.findOneAndDelete({ userId: user._id });
      await new Token({ userId: user._id, token: tokenValue }).save();
  
      // Create verification link
      const link = `http://localhost:5000/api/v1/users/${tokenValue}`;

await sendEmail({
  email: user.email,
  subject: "Email Verification",
  html: 
  `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6dd5fa, #2980b9); color: white; text-align: center; padding: 40px 20px;">
      <h1 style="margin: 0; font-size: 28px;">Welcome to TripBudget!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Let's get started by verifying your email.</p>
    </div>
    <div style="padding: 30px 20px; text-align: center; background-color: #f9f9f9;">
      <p style="font-size: 16px; color: #333;">Click the button below to verify your email and start your journey with TripBudget.</p>
      <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 30px; font-size: 16px; color: white; background-color: #2980b9; border-radius: 6px; text-decoration: none; transition: background 0.3s;">
        Verify Email
      </a>
    </div>
    <div style="padding: 15px 20px; text-align: center; font-size: 12px; color: #999; background-color: #f1f1f1;">
      If you did not sign up for TripBudget, please ignore this email.
    </div>
  </div>`
  
});

     
  
      res.status(200).send("Verification email sent");
    } catch (err) {
      res.status(500).send(err.message);
    }


  

});
const getverifyemail = asyncHandler(async (req, res) => {
 
   try {
    const tokenDoc = await Token.findOne({ token: req.params.token });
    if (!tokenDoc) return res.status(400).send("Invalid or expired token");

    await User.findByIdAndUpdate(tokenDoc.userId, { verified: true });
    await Token.deleteOne({ _id: tokenDoc._id });
    res.redirect('http://localhost:5173/account?verified=true'); 

    // res.send("Email verified successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }


  

});

 
export {registerUser,loginUser,logoutUser,refreshtoken,getCurrentUser,updateProfile,deleteaccount,editProfile,verifyEmail,getverifyemail}
