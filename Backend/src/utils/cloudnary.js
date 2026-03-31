import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadfilecloudnary = async (filepath) => {
  try {
    if (!filepath) return null;

    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto"
    });

    if (filepath) fs.unlinkSync(filepath);

    return response;

  } catch (error) {
    console.error("Cloudinary error:", error);

    if (filepath) fs.unlinkSync(filepath);

    return null;
  }
};

export { uploadfilecloudnary };
