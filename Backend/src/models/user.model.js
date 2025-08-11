import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema= new mongoose.Schema({
      username: {
            type: String,
<<<<<<< HEAD
            // required: true,
=======
            required: true,
>>>>>>> e4db1e0 (Initial commit)
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
<<<<<<< HEAD
            isVerified: false
            
=======
>>>>>>> e4db1e0 (Initial commit)
        },
        fullname: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
          
        },
      
      
        password: {
            type: String,
<<<<<<< HEAD
            // required: [true, 'Password is required']
=======
            required: [true, 'Password is required']
>>>>>>> e4db1e0 (Initial commit)
        },
        refreshToken: {
            type: String

<<<<<<< HEAD

        },
        form:{
            fullname:String,
            email:String,
            inquiry:String,
            about:String
        }
        
        
=======
        }
>>>>>>> e4db1e0 (Initial commit)
},{timestamps:true})
userSchema.pre("save",async function (next) {
      if(!this.isModified("password")) return next();

    this.password =  await bcrypt.hash(this.password,10)
    next()
    
 })
 userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
 }
 userSchema.methods.generateAccesstoken =  function () {
    return jwt.sign({ _id: this._id,
           },process.env.ACCESS_TOKEN_SECRET,{
                 expiresIn: process.env.ACCESS_TOKEN_EXPIRY
                
            })
 }
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

 export const User = mongoose.model('User',userSchema) 