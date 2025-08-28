import mongoose from "mongoose";
// collection [in Data base app]= model [in folder structure]
export const userGender = {
  male: "male",
  female: "female",
};
export const userRole = {
  user: "user",
  admin: "admin",
};
export const userProviders = {
  system: "system",
  google: "google",
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    coverImages: [
      {
        public_id: { type: String },
        secure_url: { type: String },
      },
    ],
    phone: {
      type: String,
      // required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: Object.values(userGender),
      default: userGender.male,
    },
    age: {
      type: Number,
      // required: true,
      min: 18,
      max: 60,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.user,
    },
    otp: {
      type: String,
    },
    isDeleted: Boolean,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId, // populate subject
      ref: "User", // collection name
    },
    provider: {
      type: String,
      enum: Object.values(userProviders),
      default: userProviders.system,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
