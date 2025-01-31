import Apierror from '../utils/Apierror'
import Apiresponse from '../utils/apiresponse'
import asynchandler from '../utils/asynchandler.js'
import jwt from 'jsonwebtoken';
import user from '../models/user.models.js';


export const verifyJWT=asynchandler(async(req,_,next)=>{  //here res is not used so we can write _ in that place 
  try{
    const token= req.cookie?.accessToken|| req.header("Authorization")?.replace("Bearer","");

  if(!token){
    throw new Apierror(401,"Unauthorised request");

  }
  //the veify verifies the access token
  const decodedtoken =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

  await user.findById(decodedtoken?._id).select("-password -refershtoken");


  if(!user){
    throw new Apierror(401,"invalid Access token" )
  }

  //adding new object in req so that we are able to acces the tokens in the logout function so that we can 
// easily find the user and logout the function 
  req.user=user;
  next();  //because it is the middleware
}
catch(err){
    throw new Apierror(401,err?.message || "invalid access token")
}

})