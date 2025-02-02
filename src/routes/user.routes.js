import { Router } from "express";
import {verifyJWT}from "../middlewares/auth.middleware.js"
import {loginuser,
     registerUser,
     logoutuser,
     refreshaccesstoken,
     changecurrectuserpassword,
    getcurrectuser,
    updateaccout,
    updateavatar,
    updatecoverimage,
    getuserchannelprofile,
    getwatchhistory} from '../controllers/user.controllers.js';
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
router.route("/logout").post(verifyJWT,logoutuser);

router.route("/refresh-token").post(refreshaccesstoken)

router.route("/change-pasword").post(verifyJWT,changecurrectuserpassword);
router.route("/current-user").get(verifyJWT,getcurrectuser);

//we are using patch because we want that the particular value changes 
router.route("/update-profile").patch(verifyJWT,updateaccout);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateavatar);
router.route("/update-coverimage").patch(verifyJWT,upload.single("coverimage"),updatecoverimage);

//here we are taking username from param so we have to write the url carefully 
router.route("/channel/:username").get(verifyJWT,getuserchannelprofile);
router.route("/history").get(verifyJWT,getwatchhistory);

export default router;
