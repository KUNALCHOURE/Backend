import asynchandler from '../utils/asynchandler.js';
import Apierror from "../utils/Apierror.js";
import user from "../models/users.models.js";
import {uploadcloudinary} from"../utils/cloudinary.js";
import Apiresponse from '../utils/apiresponse.js';
const registerUser=asynchandler(async(req,res)=>{
   //get the user details 
   // validation -not empty
   //check if user alresadt exits :username,email
   // check images check for avatar 
   // upload them on cloudinary 
   // create user object -create entry in db
   // remove password and refersh token feild from response
   //check for user creation 
   //return res

    let {fullname,username,email,password}=req.body;
         console.log(email);
    if([fullname,email,username,password].some((field)=>{
         field?.trim()===""     // here we are cheking if the feilds are not empty 
    }))
    {
      throw new Apierror(400,"All feilds are required")
    }
// checking user
    let existeduser=await user.findOne({
      $or:[{username},{email}]   //here we had used $or which help us to check if the username or email is already 
                                // there or not 
    })

    if(existeduser){
      throw new Apierror(409,"user with username or email alreday exist")
    }

    // mmulter provide acces of the files using multers 
    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    const coverimagelocalpath = req.files?.coverimage?.[0]?.path || "";

    if (!avatarlocalpath) {
        throw new Apierror(400, "Avatar image is required");
    }

   const avatarupload=await uploadcloudinary(avatarlocalpath)
   const coverupload=await uploadcloudinary(coverimagelocalpath);

console.log(avatarupload);

   if(!avatarupload){
      throw new Apierror(400 ,"Avatar image is required");

   }
 
   //creaating object and adding it to the database 
 const usersave= await user.create({
      username:username.toLowerCase(),
      email,
      fullname,
      avatar:avatarupload.url,
      coverimage:coverupload?.url || "",
      password
   })

   // to check if the user is created or not 
   const createduser=await user.findById(usersave._id).select( // using select function we can choose which function we wil not select 
      "-password -refereshtoken"                         // we have to write them with the - sign and add space between 2 new fields 
                                                         // through this the password and the referechtoken will not be included in the object
   )
   console.log(createduser);

    if(!createduser){
      throw new Apierror(500,"there is a problem while registering the user ")
    }
    return res.status(201).json(
      new Apiresponse(200,createduser,"user registered succesfully ")

    )
})

export {registerUser};