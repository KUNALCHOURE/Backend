import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videcscheme=new Schema({

    videofile:{
        type:String,
        reqired:true
    },
    thumbnail:{
        type:String,
        reqired:true
    }
    ,
    description:{
        type:String,
        reqired:true
    }
    ,
    duration:{
        type:Number ,//from cloudinary
        required:true,
    },
    views:{
        type:Number,
        required:true

    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
}
,{timestamps:true});
videcscheme.plugin(mongooseAggregatePaginate);
const video=new model("video",videcscheme);