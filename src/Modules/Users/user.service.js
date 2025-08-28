import userModel, {
  userProviders,
  userRole,
} from "../../DB/Models/user.model.js";
import bcrypt, { hash } from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../Utils/sendEmail.utils.js";
import Joi from "joi";
import { generateToken } from "../../Utils/Token/GenerateToken.utils.js";
import { verifyToken } from "../../Utils/Token/VerifyToken.utils.js";
import { Hash } from "../../Utils/Hash/hash.utils.js";
import { Comare } from "../../Utils/Hash/compare.utils.js";
import { Encrypt } from "../../Utils/Encrypt/encrypt.utils.js";
import { Decrypt } from "../../Utils/Encrypt/decrypt.utils.js";
import { customAlphabet, nanoid } from "nanoid";
import revokeTokenModel from "../../DB/Models/revokeToken.model.js";
import { eventEmitter } from "../../Utils/emailEvent.js";
import { OAuth2Client } from "google-auth-library";
import { allowedExtension } from "../../Middlewares/Multer.middlewares.js";
import cloudinary from "../../Utils/Cloudinary/cloudinary.utils.js";

//^ ============== signUp ====================================
export const signUp = async (req, res, next) => {
  const { name, email, password, cPassword, phone, gender, age, role } =
    req.body;


  const arryPath = [];
  for (const file of req?.files.attachments) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file?.path,
      {
        folder: "sarahaApp/users/coversImages", //  Cloudinary will prefix the public_id
        // use_filename: true,
        // unique_filename: false,
        // resource_type: "auto",
      }
    );
    arryPath.push({ public_id, secure_url });
  }



  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req?.files?.attachment[0].path,
    {
      folder: "sarahaApp/users/profileImage", //  Cloudinary will prefix the public_id
    }
  );

    // * check password&cPassword or Joy
    // if (password !== cPassword) {
    //   return res
    //     .status(400)
    //     .json({ message: "Password doesn't match cPassword" });
    // }

  //check email
  const emailUser = await userModel.findOne({ email });
  if (emailUser) {
    {
      // return res.status(409).json({ message: "Email already exists" });
      throw new Error("user already exit", { cause: 409 });
    }
  }
  //hash Password
  const hash = await Hash({
    palinText: password,
    SALT_ROUNDS: +process.env.SALT_ROUNDS,
  });

  //Encrypt Phone
  const phoneEncrypt = await Encrypt({
    plainText: phone,
    SECRET_KEY: process.env.ENCRYPTION_KEY,
  });

    //* Send email

    eventEmitter.emit("sendEmail", { email });



  //   //* ==================   Upload  file section  ==================
    // req?.files? = Array of object
    // Forof method==> loop in Object and return array

    // static path ex: http://localhost:3000/uploads/users/profile/.........
    // const arrayPaths = []
    // for (const file of req?.file) {
    // arrayPaths.push(file.path)
    // }

  // * Create User
  const user = await userModel.create({
    name,
    email,
    password: hash,
    phone: phoneEncrypt,
    gender,
    age,
    role,
    coverImages: arryPath,
    profileImage: { public_id, secure_url },
  });

  return res
    .status(201)
    .json({ message: "User is created successfully", files: req.files });
};
//^ ============== logIn ====================================
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  //check email And condition
  const user = await userModel.findOne({ email, confirmed: true });
  if (!user) {
    {
      throw new Error("Email does not exist or not confirmed", { cause: 404 });
    }
  }

  const matchPassword = await Comare({
    palinText: password,
    cipherText: user.password,
  });
  // const matchPassword = bcrypt.compareSync(password, user.password); // true or false

  if (!matchPassword) {
    throw new Error("Invalid password !!! ", { cause: 400 });
  }

  //create Token
  const accessToken = await generateToken({
    payload: { id: user._id, email },
    SIGNATURE:
      user.role == userRole.user
        ? process.env.JWT_ACCESS_SECRET_USER
        : process.env.JWT_ACCESS_SECRET_ADMIN, // dynamic signature
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  const refreshToken = jwt.sign(
    { id: user._id, email },
    user.role == userRole.user ? "refresh_user" : "refresh_admin",
    {
      expiresIn: "2y",
      jwtid: nanoid(),
    }
  );

  return res.status(201).json({
    message: "User is logged successfully",
    accessToken,
    refreshToken,
  });
};
//^ ============== Get profile ====================================
export const getUser = async (req, res, next) => {
  const phone = await Decrypt({
    cipherText: req.userAuth.phone,
    SECRET_KEY: "key_123",
  });

  // const phone = CryptoJS.AES.decrypt(req.userAuth.phone, "key_123").toString(
  //   CryptoJS.enc.Utf8
  // );

  req.userAuth.phone = phone;

  return res.status(201).json({ message: "Done", user: req.userAuth });
};

//^ ============== confirmEmail profile ====================================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    throw new Error("Provide us with token", { cause: 404 });
  }
  const decoded = await verifyToken({
    payload: token,
    SIGNATURE: process.env.JWT_SIGNATURE_EMAIL,
  });

  //check email AND condidition
  const user = await userModel.findOne({
    email: decoded.email,
    confirmed: false,
  });
  if (!user) {
    throw new Error("User not exists or already confirmed", { cause: 404 });
  }
  // convert confirmed to true then save
  user.confirmed = true;
  await user.save();

  return res.status(201).json({ message: "Email is confirmed" });
};
//^ ============== logOutAction  ====================================
export const logOutAction = async (req, res, next) => {
  const revokeToken = await revokeTokenModel.create({
    tokenId: req.decoded.jti,
    expireAt: req.decoded.exp,
  });

  return res.status(201).json({ message: "logOutAction" });
};
//^ ============== refreshToken  ====================================
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw new Error("Provide us with token", { cause: 404 });
  }

  const [prefix, token] = authorization.split(" ") || [];

  if (!prefix || !token) {
    throw new Error("Provide us with valid token", { cause: 409 });
  }
  let signature = "";
  if (prefix == "bearer") {
    signature = "refresh_user";
  } else if (prefix == "admin") {
    signature = "refresh_admin";
  }

  const decoded = await verifyToken({ payload: token, SIGNATURE: signature });


  //check revoke Token
  const revoked = await revokeTokenModel.findOne({ tokenId: decoded.jti });

  if (revoked) {
    {
      throw new Error("Token is revoked", { cause: 409 });
    }
  }

  //check email
  const user = await userModel.findOne({ email: decoded.email });

  if (!user) {
    {
      throw new Error("Email does not exist", { cause: 409 });
    }
  }

  //create Token
  const accessToken = await generateToken({
    payload: { id: user._id, email: decoded.email },
    SIGNATURE:
      user.role == userRole.user
        ? process.env.JWT_ACCESS_SECRET_USER
        : process.env.JWT_ACCESS_SECRET_ADMIN, // dynamic signature
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  const refreshToken = jwt.sign(
    { id: user._id, email: decoded.email },
    user.role == userRole.user ? "refresh_user" : "refresh_admin",
    {
      expiresIn: "2y",
      jwtid: nanoid(),
    }
  );

  return res
    .status(201)
    .json({ message: "refreshToken", accessToken, refreshToken });
};
//^ ============== updatePassword  ====================================
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const compare = await Comare({
    palinText: oldPassword,
    cipherText: req.userAuth.password,
  });
  if (!compare) {
    {
      throw new Error("Invalid old password", { cause: 409 });
    }
  }

  const hashPassword = await Hash({
    palinText: newPassword,
    saltOrRounds: process.env.SALT_ROUNDS,
  });

  req.userAuth.password = hashPassword; // overwrite by hashPassword


  // await req.user.save()
  await req.userAuth.save();

  await revokeTokenModel.create({
    tokenId: req?.decoded?.jti,
    expireAt: req?.decoded?.exp,
  });

  return res.status(201).json({
    message: "Password is updated",
    userUpadted_password: req.userAuth,
  });
};
//^ ============== forgetPassword  ====================================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    {
      throw new Error("Email does not exist", { cause: 409 });
    }
  }
  const otp = customAlphabet("0123456789", 4)();

  eventEmitter.emit("forgetPassword", { email, otp });

  //* ==============eventEmitter.emit ==> Instead of below ======================//

  // const isSend = await sendEmail({
  //   to: email,
  //   subject: `"Forget password-check the body for OTP"`,
  //   html: `<h1>Your otp is ${otp} </h1>`,
  // });

  // if (!isSend) {
  //   throw new Error("Fail to send email", { cause: 404 });
  // }
  //* ==============eventEmitter.emit ==> Instead of below ======================//

  const hashOtp = await Hash({
    palinText: otp,
    saltOrRounds: process.env.SALT_ROUNDS,
  });

  user.otp = hashOtp;

  await user.save();

  return res.status(201).json({ message: "Password is retrieved" });
};
//^ ============== resetPassword  ====================================
export const resetPassword = async (req, res, next) => {
  const { email, newPassword, cPassword, otp } = req.body;

  const user = await userModel.findOne({ email, otp: { $exists: true } });

  if (!user) {
    {
      throw new Error("Email does not exist or expired OTP", { cause: 409 });
    }
  }

  const compare = await Comare({
    palinText: otp,
    cipherText: user?.otp,
  });
  if (!compare) {
    {
      throw new Error("Invalid OTP", { cause: 409 });
    }
  }
  const hashNewPassword = await Hash({
    palinText: newPassword,
    saltOrRounds: process.env.SALT_ROUNDS,
  });

  const updateUser = await userModel.updateOne(
    { email },
    { password: hashNewPassword, $unset: { otp: "" } }
  );

  return res.status(201).json({ message: "resetPassword is successeded" });
};

//^ ============== update profile ====================================
export const updateProfile = async (req, res, next) => {
  const { name, email, phone, gender, age } = req.body;

  if (name) req.userAuth.name = name;
  if (gender) req.userAuth.gender = gender;
  if (age) req.userAuth.age = age;

  //Encrypt Phone
  const phoneEncrypt = await Encrypt({
    plainText: phone,
    SECRET_KEY: process.env.ENCRYPTION_KEY,
  });

  req.userAuth.phone = phoneEncrypt;
  //check email
  const emailUser = await userModel.findOne({ email });
  if (emailUser) {
    {
      throw new Error("user already exit", { cause: 409 });
    }
  }
  //============== start=====================
  // Send email
  // const token = await generateToken({
  //   payload: { email },
  //   SIGNATURE: process.env.JWT_SIGNATURE_EMAIL,
  //   options: { expiresIn: "1h" },
  // });
  // const link = `http://localhost:3000/users/confirmEmail/${token}`;

  // const isSend = await sendEmail({
  //   to: email,
  //   subject: "Hello ✔",
  //   html: `<a href="${link}">Confirm Email</a>`,
  // });

  // if (!isSend) {
  //   throw new Error("Fail to send email", { cause: 404 });
  // }

  //============== end =====================

  req.userAuth.email = email;
  req.userAuth.confirmed = false;

  req.userAuth.save();

  return res.status(201).json({ message: "Done", user: req.userAuth });
};
//^ ============== get profile data by ID ====================================
export const getProfileData = async (req, res, next) => {
  const { id } = req.params;

  //check ID

  const user = await userModel.findById(id).select("name email age gender"); // select only
  // const user = await userModel.findById(id).select('-name -email -age -gender')   // un select to remove
  if (!user) {
    {
      throw new Error("Uer does not exist", { cause: 409 });
    }
  }

  return res.status(201).json({ message: "Done [get profile data]", user });
};
//^ ============== Freeze profile ====================================
export const freezeProfile = async (req, res, next) => {
  const { id } = req.params;

  if (id && req.userAuth.role !== userRole.admin) {
    throw new Error(" Action should by Admin", { cause: 401 });
  }
  const user = await userModel.updateOne(
    {
      _id: id || req.userAuth._id, // condition
      isDeleted: { $exists: false }, // condition
    },
    {
      isDeleted: true, // excute delete
      deletedBy: req.userAuth._id, // who make the action
    },
    {
      $inc: { __v: 1 },
    }
  );

  user.matchedCount
    ? res.status(201).json({ message: "Done Freeze" })
    : res.status(401).json({ message: "Fail to  Freeze" });
  // return res.status(201).json({ message: "Done Freeze" });
};
// //^ ============== unFreeze profile ====================================
export const unfreezeProfile = async (req, res, next) => {
  const { id } = req.params;

  if (id && req.userAuth.role !== userRole.admin) {
    throw new Error(
      "You can not freeze this account or Action should by Admin",
      { cause: 401 }
    );
  }
  const user = await userModel.updateOne(
    {
      _id: id || req.userAuth._id, // condition
      isDeleted: { $exists: true }, // condition
    },
    {
      $unset: { isDeleted: "", deletedBy: "" }, // Remove isDeleted and deletedBy fields
    },
    {
      $inc: { __v: 1 },
    }
  );

  user.matchedCount
    ? res.status(201).json({ message: "Done Un Freeze" })
    : res.status(401).json({ message: "Fail to  Freeze or not found" });
  // return res.status(201).json({ message: "Done Freeze" });
};

// ng serve -o
// 25 mins

//^ ============== login With Gmail profile ====================================
export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    return payload;
  }
  const { email, email_verified, picture, name } = await verify();

  // check email And condition
  let user = await userModel.findOne(
    { email },
    { provider: userProviders.google }
  );
  if (!user) {
    {
      user = await userModel.create({
        email,
        name,
        confirmed: email_verified,
        image: picture,
        password: "123",
        provider: userProviders.google,
      });
    }
  }
  if (user.provider !== userProviders.google) {
    throw new Error("Please login on System", { cause: 401 });
  }

  const accessToken = await generateToken({
    payload: { id: user._id, email },
    SIGNATURE:
      user.role == userRole.user
        ? process.env.JWT_ACCESS_SECRET_USER
        : process.env.JWT_ACCESS_SECRET_ADMIN, // dynamic signature
    options: { expiresIn: "1y", jwtid: nanoid() },
  });

  const refreshToken = jwt.sign(
    { id: user._id, email },
    user.role == userRole.user ? "refresh_user" : "refresh_admin",
    {
      expiresIn: "2y",
      jwtid: nanoid(),
    }
  );

  return res.status(201).json({
    message: "User is logged By Gmail",
    accessToken,
    refreshToken,
  });
};

//^ ============== update Image profile ====================================
export const updateProfileImage = async (req, res, next) => {
  const arryPath = [];

  for (const file of req?.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file?.path
      // {
      //   folder: "sarahaApp/users/coversImages", //  Cloudinary will prefix the public_id
      // }
    );

    arryPath.push({ secure_url, public_id });
  }


  const user = await userModel.findByIdAndUpdate(
    { _id: req?.userAuth._id },
    { coverImages: arryPath }
  );
 

  for (const image of user?.coverImages) {
      await cloudinary.uploader.destroy(image?.public_id)

  }


  

  return res.status(201).json({ message: "Done", user });
};
