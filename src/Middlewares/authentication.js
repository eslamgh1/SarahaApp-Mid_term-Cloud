import userModel from "../DB/Models/user.model.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { verifyToken } from "../Utils/Token/VerifyToken.utils.js";
import revokeTokenModel from "../DB/Models/revokeToken.model.js";

export const authentication = async (req, res, next) => {
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
    signature = "access_user";
  } else if (prefix == "admin") {
    signature = "access_admin";
  }


  const decoded = await verifyToken({ payload: token, SIGNATURE: signature });


    //check revoke Token
  const revoked = await revokeTokenModel.findOne({tokenId:decoded.jti})

  if (revoked) {
    {
      throw new Error("Token is revoked", { cause: 409 });
    }
  }

  //check ID
  const user = await userModel.findById(decoded.id)   // remove .lean()  to use remove method

  if (!user) {
    {
      throw new Error("Email does not exist", { cause: 409 });
    }
  }

  if(!user?.confirmed || !user?.isDeleted == false){
      throw new Error("Please confirm email first or account is freezed", { cause: 400 });
  }


  req.userAuth = user;
  req.decoded = decoded;

  return next();
};
