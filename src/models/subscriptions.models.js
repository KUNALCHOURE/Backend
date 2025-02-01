import mongoose, { model } from "mongoose";

import { Schema } from "mongoose";
import user from "./users.models";

const subscriptionschema=new Schema({
    
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user,
        required:true,
    },

  channels:{
        type:mongoose.Schema.Types.ObjectId,
        ref:user,
        required:true,
    }

},{timestamps:true})


const subscription=new model("subscription",subscriptionschema);

export {subscription};