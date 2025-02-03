import mongoose, { model, Schema } from "mongoose";

const tweetschema=new Schema({
   
    content:{
        type:String,
        required:true,
    },

    owner:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
   
},{timestamps:true})

//ability to control the videos 

const tweet=new model("tweet",tweetschema);
export {tweet};

