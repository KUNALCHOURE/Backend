import express from 'express';
import connectdb from './db/index.js';
import app from './app.js';

import dotenv from "dotenv";
dotenv.config();

//connecttodb is a async function so it will return a promise
connectdb()
.then(()=>{
  app.listen(8000,()=>{
    console.log(`App is listening to port:${process.env.PORT}`);
  })
  console.log("database connected");

})
.catch((e)=>{
  console.log("ERROR",e);
})
