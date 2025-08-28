import mongoose from "mongoose";
// collection [in Data base app]= model [in folder structure]

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      minLength: 1,
    },

userId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User", // collection name
  required:true
}
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default messageModel;
