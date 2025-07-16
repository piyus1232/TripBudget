import { registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { loginUser,logoutUser ,getCurrentUser,updateProfile} from "../controllers/user.controller.js";
const router = Router();
 router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
router.route("/updateProfile").post(
  verifyJWT, 
  upload.fields([
    { name: "avatar", maxCount: 1 }
  ]),        
  updateProfile 
);


router.get("/test-token", (req, res) => {
  res.json({ cookies: req.cookies });
});





router.route("/logout").post(verifyJWT,  logoutUser)
export default router