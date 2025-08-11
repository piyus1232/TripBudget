import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
 

cloudinary.config(
    { 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
}
)
const uploadfilecloudnary =  async(filepath)=>{
    try{
        if(!filepath) return null;

    const response = await cloudinary.uploader.upload(filepath,{resource_type:"auto"})
<<<<<<< HEAD
         fs.unlinkSync(filepath)
      
        return response;

=======
      
        return response;
>>>>>>> e4db1e0 (Initial commit)
    }
    catch(error){
            
            console.log(error);
<<<<<<< HEAD
            fs.unlinkSync(filepath)
=======
            fs.unlinkSync(localFilePath)
>>>>>>> e4db1e0 (Initial commit)
            return null;
            

    }


}
export {uploadfilecloudnary}