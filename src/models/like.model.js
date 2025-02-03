import mongoose, { model, Schema } from "mongoose";

const likeschema=new Schema({
   
    comment:{
        type:Schema.Types.ObjectId,
        ref:"comments"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"videos"
    }
    ,
 
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    tweet:{
         type:Schema.Types.ObjectId,
        ref:"tweets"
    }
},{timestamps:true})

//ability to control the videos 

const like=new model("like",likeschema);
export {like};

