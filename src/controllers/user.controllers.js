import asynchandler from '../utils/asynchandler.js';
import Apierror from "../utils/Apierror.js";
import user from "../models/users.models.js";
import {uploadcloudinary} from"../utils/cloudinary.js";
import Apiresponse from '../utils/apiresponse.js';
import jwt from "jsonwebtoken";
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

  let result = await user.findOne({
    $or: [{ username: username }, { email: email }] // this will help us find a user based on email or username
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


const refreshaccesstoken=asynchandler(async(req,res)=>{ //req.body is used for the user accesing from mobile 

  try{
    const incomminrefreshtoken=req.cookie.refreshtoken|| req.body.refreshToken   ;
    if(!incomminrefreshtoken){
      throw new Apierror(400,"Unauthorised access");
    }
    const decodedtoken =jwt.verify(incomminrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
   
     const foundedduser=await user.findById(decodedtoken?._id);
     if(!foundedduser){
      throw new Apierror(400,"invalid refreshtoken ");
    }

    if(incomminrefreshtoken!== foundedduser.refreshtoken) {
      throw new Apierror(401,"Invalid refresh token");
    }

// once the verification is done then we will again generate access and refreshtoken 
   
  const options={
    httpOnly:true,
    secure:true
  }

  const {accesstoken,refreshtoken}=await generateAccessandrefershtoken(foundedduser._id);

  return res
  .status(200)
  .cookie("accessToken",accesstoken,options)
  .cookie("refreshToken",refreshtoken,options)
  .json(
    new Apiresponse(200,{
      accesstoken,refereshtoken
    },
  " Acess token refreshed succesfully "
)
  )
}
catch(err){
  throw new Apierror(400,err.message || "there is a problem while refreshing token ")
}

})


const changecurrectuserpassword=(asynchandler(async(req,res)=>{
   const {oldpassword,newpassword}=req.body;
 
   const userfind=await user.findById(req.user?._id);

   const ispasscorrect=await userfind.ispasswordcorrect(oldpassword);
    
    if(!ispasscorrect){
      throw new Apierror(400,"The oldpassword is not coorect please enter the correct password ")
    }
//saving the new password in the database 
     userfind.password=newpassword;   // isme await mat lagana 
     // we dont want other validations to run so we are writting validatebeforesave:false;
    console.log(userfind.password)
      await userfind.save({validateBeforeSave:false});
      

  return res
  .status(200)
  .json(
    new Apiresponse(200,{}
      ,"Password changes successfully"
    )
  )

}))


const getcurrectuser=asynchandler(async(req,res)=>{
let userobject=req.user;
    // select method dont work on js object 
                                        // they only work on mongoose query
  return res.status(200)
  .json(
    new Apiresponse(200,
    { userobject}
    ,"The user is succesfully found ")

  )

   
})


//when you are updating files so make different controllers for them because  text data will save many time so it is not a good practice  
const updateaccout=asynchandler(async(req,res)=>{
  
  let{username,fullname,email}=req.body;

  if(!username || !fullname || !email){
    throw new Apierror(400,"Values are empty");

  }
 console.log(fullname);
 const userfind=await user.findByIdAndUpdate(req.user?._id,{
  $set:{
    username:username,
    fullname:fullname,
    email:email,
  },
 },{new:true,select:"-password"}
); // new:true se ye hota hai ki updatehone ke bad jo inormation hai woh hame miljati hai

console.log(userfind);
  if(!userfind){
    throw new Apierror(400,"Unauthorizzed access");

  }
  req.user=userfind;
  
return res.status(200)
.json(new Apiresponse(200,{},"account updated successfully "));
}
);


const updateavatar=asynchandler(async(req,res)=>{
// we are using only files in and in the files only the avatar image path will come so we have to just write 
 // req.file?.url

  let avatarnewpath=req.file?.path;

  if(!avatarnewpath){   // condition sahi lagana ek condition(!) nahi lagane se error aa raha tha 
    throw new Apierror(400,"Avatar file is missing");

  }
  let imageupload=await uploadcloudinary(avatarnewpath);
console.log(imageupload);
  if(!imageupload.url){
    throw new Apierror(400,"Problem occured while saving in cloudinary ")
  }

  const result =await user.findByIdAndUpdate(req.user?._id,{
    $set:{
      avatar:imageupload.url
    }
  },{new:true}).select("-password");

  return res.status(200)
  .json(new Apiresponse(200,{result}
    ,
    "Avatar image updated"
  ))


})


const updatecoverimage=asynchandler(async(req,res)=>{
// we are using only files in and in the files only the cover image path will come so we have to just write 
 // req.file?.url
  let covernewpath=req.file?.path;

  if(!covernewpath){
    throw new Apierror(400,"coverimage file is missing");

  }
  let coverupload=await uploadcloudinary(covernewpath);

  if(!coverupload.url){
    throw new Apierror(400,"Problem occured while saving in cloudinary ")
  }

  const response=await user.findByIdAndUpdate(req.user?._id,{
    $set:{
      coverimage:coverupload.url
    }
  },{new:true}).select("-password");


  return res.status(200)
  .json(new Apiresponse(200,{response}
    ,
    "Cover image updated"
  ))

})

const getuserchannelprofile=asynchandler(async(req,res)=>{
   // we will get the username from the params or the url like channel/kunal

  const{username}=req.params;

   if(!username?.trim()){
    throw new Apierror(400,"the username is missing ");

   }
   // final value comes as an array after pipelining 
   //creating pipelines for doing operations 
  const channel= await user.aggregate([
    {
      $match:{
        username:username?.toLowerCase()
      }
    },

    {
      //for finding subscriber
      $lookup:{
        from:"subscription",
        localFeild:"_id",
        foreignFeild:"channel",
        as:"Subscribers"
      }
    },
    {
      // for finding channels 
      $lookup:{
        from:"subscription",
        localFeild:"_id",
        foreignFeild:"subscriber",
        as:"Subscribeto"
      }
    },
    {
      //here we are adding new feilds 
      $addFeilds:{
        subscriberscount:{
          $size:"$Subscribers"
        },
        channelsSubscribetocount:{
          $size:"$Subscribeto"
        },


        isSubscribed:{
          $condition:{
            if:{$in:[req.user?._id,$Subscribers.subscriber]},
            then:true,
            else:false
          }
        }
      }
    },
 //
  {
    $project:{
      fullname:1,
      username:1,
      subscriberscount:1,
      channelsSubscribetocount:1,
       avatar:1,
       coverimage:1,
       email:1
    }
  }

  ])

  if(!channel?.length){
    throw new Apierror(400, "channels does not exits");
  }
  
  return res.status(200)
  .json(
    new Apiresponse(200,channel[0],"user channel fetched successfully ")
  )
})

const getwatchhistory=asynchandler(async(req,res)=>{
   // wheneve we do this we get string not the mongoid
               //but we are using mongoose so when  we give it to the mongoose it convert it to the mongoid

   const founduser=await user.aggregate([
   // in aggreagation the id is directly given it is not converted so we haav to explicitly convert it to the mongo id 
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)

      }
    },
    {
      $lookup:{
        from:"videos",
        localFeild:"whatchHistory",
        foreignFeild:"-id",
        as:"watchhistory",
        pipeline:[
            {
              $lookup:{
                  from:"users",
                  localFeild:"owner",
                  foreignFeild:"_id",
                  as:"owner",

                  pipeline:[
                    {
                      $project:{
                        fullname:1,
                        username:1,
                        avatar:1
                      }
                    },
                    {
                       $addFeilds:{
                        owner:{
                          $first:"Owner"
                        }
                       }
                    }
                  ]
              }
            }
        ]
      }
    }
   ])

   return res.status(200)
   .json(
    new Apiresponse(200,
      founduser[0].watchHisotry,
      "Watch history fetched  successfully "
    )
   )
})

export {registerUser
  ,loginuser,
  logoutuser
  ,refreshaccesstoken
  ,changecurrectuserpassword
  ,getcurrectuser,
  updateaccout,
  updateavatar,
  updatecoverimage,
  getuserchannelprofile,
  getwatchhistory

};