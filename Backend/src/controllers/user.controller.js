import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {upload} from "../middleware/multer.middleware.js"
import { uploadfilecloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken"


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



export {registerUser,loginUser,logoutUser,refreshtoken,getCurrentUser,updateProfile,deleteaccount,editProfile}
