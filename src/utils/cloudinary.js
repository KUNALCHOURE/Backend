import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ✅ Correct Cloudinary Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,  // ✅ Use process.env
    api_secret: process.env.CLOUDINARY_API_SECRET  
});

// ✅ Fixed Upload Function
const uploadcloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) {
            console.log("localfilepath is missing");
            return null;
        }

        // ✅ Upload the file to Cloudinary
        let response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        console.log("Uploaded successfully:", response.url);

        // ✅ Remove local file after successful upload
        fs.unlinkSync(localfilepath);

        return response;
    } catch (err) {
        console.error("Cloudinary upload failed:", err);

        // ❌ Remove the file if the upload fails
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return null;
    }
};

export { uploadcloudinary };
