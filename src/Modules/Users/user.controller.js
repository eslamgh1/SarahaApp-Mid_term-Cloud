import { Router } from "express";
import * as userServices from "./user.service.js";
import { authentication } from "../../Middlewares/authentication.js";
import { validation } from "../../Middlewares/valiadation.js";
import * as userValidatiom from "./user.validation.js";
import {allowedExtension, MulterHost} from "../../Middlewares/Multer.middlewares.js";
import { userRole } from "../../DB/Models/user.model.js";
import { authorization } from "../../Middlewares/authorization.js";


const userRouter = Router();
//single("attachment") attachment refers to key in the Form Postman
userRouter.post("/signup",MulterHost({
  customPath:"users/profile", 
  customExtensions: [
    ...allowedExtension.image,
    ...allowedExtension.video,
    ...allowedExtension.pdf,
  ]}).fields([
    {name: "attachment" ,maxCount:1},
    {name: "attachments", maxCount:2}
  ]),
    validation(userValidatiom.signupSchema),
  userServices.signUp
);


// userRouter.post("/signup",Multer().single("image"), validation(userValidatiom.signupSchema), userServices.signUp);
userRouter.post(
  "/login",
  validation(userValidatiom.loginSchema),
  userServices.login
);
userRouter.post("/login/login-gmail", userServices.loginWithGmail);
userRouter.get("/getuser", authentication, userServices.getUser);
// userRouter.get("/getuser", authentication,authorization([userRole.admin]), userServices.getUser);
userRouter.get("/confirmemail/:token", userServices.confirmEmail);
userRouter.post("/logout", authentication, userServices.logOutAction);
userRouter.get("/refreshtoken", userServices.refreshToken);
userRouter.get(
  "/updatePassword",
  validation(userValidatiom.upadtePasswordSchema),
  authentication,
  userServices.updatePassword
);
userRouter.put("/forgetpassword", userServices.forgetPassword);
userRouter.put(
  "/resetpassword",
  validation(userValidatiom.resetPasswordSchema),
  userServices.resetPassword
);
userRouter.put(
  "/resetpassword",
  validation(userValidatiom.resetPasswordSchema),
  userServices.resetPassword
);
userRouter.patch(
  "/updateprofile",
  validation(userValidatiom.updateProfileSchema),
  authentication,
  userServices.updateProfile
);

userRouter.patch(
  "/updateProfileImage",

  MulterHost({
  customPath:"users/profile", 
  customExtensions: [
    ...allowedExtension.image,
    ...allowedExtension.video,
    ...allowedExtension.pdf,
  ]}).array("attachments"),

  // validation(userValidatiom.updateProfileImageSchema),
  authentication,
  userServices.updateProfileImage
);
userRouter.get("/getprofile/:id", userServices.getProfileData);
userRouter.delete(
  "/freeze/{:id}",
  validation(userValidatiom.freezeSchema),
  authentication,
  userServices.freezeProfile
);
userRouter.delete(
  "/unfreeze/{:id}",
  authentication,
  userServices.unfreezeProfile
);

export default userRouter;
