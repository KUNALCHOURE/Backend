import { Router } from "express";

import {loginuser, registerUser} from '../controllers/user.controllers.js';
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

export default router;
