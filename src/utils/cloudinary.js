import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload to cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // file upload success
        console.log("File uploaded successfully: ", cloudinaryResponse.url);
        return cloudinaryResponse;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the localy temporary save file as the upload failed
        return null;
    }
}

export { uploadOnCloudinary }
