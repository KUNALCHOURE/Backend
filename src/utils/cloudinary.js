import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:CLOUDINARY_API_KEY, 
        api_secret:CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
    });
})

const uploadcloudinary=async (localfilepath)=>{
    try{
        if(!localfilepath)return null;
        // uplaod thee file in cloudianry
        let response =await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        });
        //file has been uploaded suuccesfully 
        console.log("uploaded succesully ",response.url);
        return response;

    }
    catch(err){
        fs.unlinkSync(localfilepath) //removethee localy saved temp file as the
        // uplaod operation is failed 
        

    }
}

export {uploadcloudinary};