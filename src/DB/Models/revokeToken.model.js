import mongoose from "mongoose";
// collection [in Data base app]= model [in folder structure]

const revokeTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
    },

expireAt:{
      type: String,
      required: true,
}
  },
  {
    timestamps: true,
  }
);

const revokeTokenModel = mongoose.models.RevokeToken || mongoose.model("RevokeToken", revokeTokenSchema);

export default revokeTokenModel;
