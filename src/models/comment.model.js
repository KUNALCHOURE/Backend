import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentschema=new Schema({
   
    content:{
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
    }
},{timestamps:true})

//ability to control the videos 
commentschema.plugin(mongooseAggregatePaginate);

const comment=new model("comment",commentschema);
export {comment};

