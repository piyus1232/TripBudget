import { registerUser } from "../controllers/user.controller.js";
import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import userform from "../controllers/form.controller.js";
// import { scrapeRedbusBuses } from "../controllers/buses.controller.js";
import { getNearbyHotels } from "../controllers/hotel.controller.js";


import { loginUser,logoutUser ,getCurrentUser,updateProfile,deleteaccount,editProfile} from "../controllers/user.controller.js";
// import { getplaces } from "../controllers/places.controller.js";
import { getCheapestRoundTripTrains } from "../controllers/getcheapesttrain.js";
import { finalcontroller } from "../controllers/finalcontroller.js";
// import { savedtrip } from "../controllers/savedtrip.controller.js";
import { deletedtrips, getSavedTrips } from "../controllers/savetripfind.controller.js";


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
router.route("/train").post(verifyJWT,finalcontroller);
router.route("/hotel").post(getNearbyHotels);
// router.route("/places").post(getplaces);

// router.get("/test-token", (req, res) => {
//   res.json({ cookies: req.cookies });
// });





router.route("/logout").post(verifyJWT,  logoutUser)

router.route("/form").post(userform) 

// router.route("/savetrip").post(savedtrip)
router.route("/getsavetrip").get(verifyJWT,getSavedTrips)  
router.delete("/getsavetrip/:id", verifyJWT, deletedtrips);

router.route("/deleteaccount").post(verifyJWT,  deleteaccount)
router.route("/editprofile").put(verifyJWT,editProfile)

export default router