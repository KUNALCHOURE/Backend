import asynchandler from '../utils/asynchandler.js';
import Apierror from "../utils/Apierror.js";
import user from "../models/users.models.js";
import {uploadcloudinary} from"../utils/cloudinary.js";
import Apiresponse from '../utils/apiresponse.js';

const generateAccessandrefershtoken=async(userID)=>{
   try {
   let userinfo=await user.findById((userID));
  
//please write await in front of  therse function this error took 1.5 hr to debug
  const accesstoken= await userinfo.generateAcessToken();
  const refreshtoken=await userinfo.generateRefreshToken();
 

  userinfo.refreshtoken=refreshtoken;
 await userinfo.save({validateBeforeSave:false});  // if we save in the db the validationd will run 
                                            // and we dont want that so we will use valuidateBeforeSave:false  
               console.log(accesstoken);
               console.log(refreshtoken);                              
  return{accesstoken,refreshtoken};
    
   } catch (error) {
       throw new Apierror(500,"something went wrong wile creating access and referesh token ")
   }
}



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

const loginuser=asynchandler(async(req,res,)=>{
  //re body->  data
  // username or email
  // find the user 
  // password check 
  //access and referesh token 

   let{email,username,password}=req.body;
   
  if(!username &&!email){
     throw new Apierror(400,"username or password is required");
  }

   let result=await user.findOne({
    $or:[{username},{email}]  // this will help us to find  user based on email or username 
  });

   if(!result){
    throw new Apierror(400,"THERE IS A PROBLEM WHILE LOGING IN user does not exist  ")

  }
 // here we want to use the ispassswordcorrect method that is created by us so  it will be available 
 // in this instance of user that we had find so we have to use the result here 
 //user will be used when we are using the  predefined mongo db methods 
   let ispasscorect= await result.ispasswordcorrect(password);
   
   if(!ispasscorect){
     throw Apierror(400,"Username is not correct");
   }
   
   // if the user is already register and will succesfully login then we will create the access and referesh token 
   // so lets create the methods 

  const{accesstoken,refreshtoken}=await generateAccessandrefershtoken(result._id);

  console.log(accesstoken);
  console.log(refreshtoken);
  const loggedinuser=await user.findById(result._id).select("-password -refreshtoken");

  
  //cookies 
  const options={   //the cookies can generaly be modied from the frontend so for security 
                  // we add this httpOnly nad secure as true ,so it doesnt allow modifying cookies from the frontend 
                  // and the cookies can be only modified from the server 
                
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    path: '/'  // Explicitly setting the path
                  
  }

  return res
  .status(200)
  .cookie("accessToken",accesstoken,options)
  .cookie("refreshToken",refreshtoken,options)
  .json(
    new Apiresponse(200,{
      user:loggedinuser,accesstoken,
      refreshtoken
    },
  "user logged in succesfully"
)
  )
  
})

const logoutuser=asynchandler(async(req,res)=>{
    
 let userid= req.user._id
await user.findByIdAndUpdate(userid,{
  $set:{
    refreshtoken:undefined,
  }
},
{
  new:true // new updated value is returned 
}
)

const options={   //the cookies can generaly be modied from the frontend so for security 
                  // we add this httpOnly nad secure as true ,so it doesnt allow modifying cookies from the frontend 
                  // and the cookies can be only modified from the server 
httpOnly:true,
secure:true
}

return res
.status(200)   // using clearcookie the cookies will be cleared 
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new Apiresponse(200,{},"userlogged out"));


})

export {registerUser,loginuser,logoutuser};