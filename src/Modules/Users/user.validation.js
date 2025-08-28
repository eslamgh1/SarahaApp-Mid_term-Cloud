import Joi from "joi";
import { userGender } from "../../DB/Models/user.model.js";

export const signupSchema = {
  body: Joi.object({
    name: Joi.string().alphanum().min(4).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("password")).required(),
    gender: Joi.string().valid(userGender.male, userGender.female).required(),
    age: Joi.number().min(18).max(60).positive().required(),
    phone: Joi.string().required(),
  }).required(),

  files: Joi.object({
    attachment: Joi.array().required(),
    attachments: Joi.array().required(),
  }),

  // // file only one schema
  // file: Joi.object({
  // filename: Joi.string().required(),
  // mimetype: Joi.string()
  //   // .valid('image/jpeg', 'image/png', 'image/jpg') // Specify allowed types
  //   .required()
  //   .messages({
  //     "any.only": "File must be a JPEG or PNG image",
  //     "any.required": "File type is required",
  //   }),

  // size: Joi.number()
  //   .max(5 * 1024 * 1024) // 5MB limit
  //   .required()
  //   .messages({
  //     "number.max": "File size must not exceed 5MB",
  //     "any.required": "File size is required",
  //   }),
  // })
  // .unknown(true) // This allows other fields from Multer
  // .required()
  // .messages({
  //   "any.required": "A file is required",
  // }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required(),
  params: Joi.object({
    name: Joi.string(),
  }),
};
export const upadtePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }).required(),
};
export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    newPassword: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
    otp: Joi.string().min(4).required(),
  }).required(),
};
export const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().alphanum().min(4).max(30),
    email: Joi.string().email(),
    gender: Joi.string().valid(userGender.male, userGender.female),
    age: Joi.number().min(18).max(60).positive(),
    phone: Joi.string(),
  }),
};
export const freezeSchema = {
  params: Joi.object({
    id: Joi.string(),
  }),
};

export const updateProfileImageSchema = {
  files: Joi.object({
    // attachment: Joi.array().required(),
    attachments: Joi.array().required(),
  }),
};
