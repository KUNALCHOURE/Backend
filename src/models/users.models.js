import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userschema=new mongoose.Schema({

    watchHisotry:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"videos"
        },
    ],
     username:{
     type:String,
      required:true,
      unique:true,
      lowercase:true,
      trim:true,
     }
     ,
     email:{
        type:String,
         required:true
        },
    
     fullname:{
     type:String,
    required:true
    },

    avatar:{
        type:String,
        required:true
    }
    ,
    coverimage:{
        type:String,
    required:true
    }
    ,
    password:{
        type:String, 
    required:[true,"passwrod is required"]
    },
    refereshtoken:{
        type:String,
    required:true
    },

},{timestamps:true})

userschema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password=await bcrypt.hash(this.password,10)
    next();
})


//method to check wheather the password is correct or not 
userschema.methods.ispasswordcorrect=async function(password){
  // this will return true or false 
    return await bcrypt.compare(password,this.password);
}

userschema.methods.generateAcessToken=async function(){
   return jwt.sign(
    { //PAYLOD -INFO GIVEN
        _id:_id,
        email:this.email,
        username:this.username,
        fullname:this.fullname,

    },
    process.env.ACCESS_TOKEN_SECRET, 
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY 

    },

   )
}

userschema.methods.generateRefreshToken=async function(){
    return jwt.sign(
        {
            _id:_id,
           
    
        },
        process.env.REFERSH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFERESH_TOKEN_EXPIRY
    
        },
    
       )
}


const user=new mongoose.model('user',userschema);

export default user;
