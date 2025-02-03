import mongoose, { model, Schema } from "mongoose";

const playlistschema=new Schema({
   
    name:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true,
    },

    video:{
        type:Schema.Types.ObjectId,
        ref:"videos"
    }
    ,
 
    owner:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
  
},{timestamps:true})

//ability to control the videos 

const playlist=new model("playlsit",playlistschema);
export {playlist};

