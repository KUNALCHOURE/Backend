import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();
//always use () for cookew parser.It took 1 hour to find the error and the error 
 // is found that i had not added () after cookie parser
 app.use(cookieParser()) // to access cookies 

app.use(cors({
  origin: "*",  // or specify an allowed origin like "http://localhost:3000"
  credentials: true,  // Allow cookies to be sent
}));

app.use(express.json({limit:"16kb"}))// used for parsing data in json format 
app.use(express.urlencoded({extended:true,limit:"16kb"})) //(find good defination for interview) used for json parsing of urlencoded data 
app.use(express.static("public"))



//routes
import userrouter from "./routes/user.routes.js";

//routes decalaration
app.use("/api/v1/users",userrouter);


export default app;



