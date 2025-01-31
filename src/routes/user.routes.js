import { Router } from "express";
import {verifyJWT}from "../middlewares/auth.middleware.js"
import {loginuser, registerUser,logoutuser} from '../controllers/user.controllers.js';
import {upload} from "../middlewares/multer.middleware.js"

const router=Router();  // it is like app of express

router.route("/register").post(
    upload.fields([  // upload is the middleware that is being used 
                      // to handle the images that are comming from the user
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginuser)

//secured routes 
//using verifyjwt as middleware 
router.route("/logout").post(verifyJWT,logoutuser)

export default router;
