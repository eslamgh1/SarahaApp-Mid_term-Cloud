import userModel from "../../DB/Models/user.model.js";
import messageModel from "../../DB/Models/message.model.js";


export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;

  const userExist = await userModel.findOne({
    _id: userId,
    isDeleted: { $exists: false },
  });


  if (!userExist) {
    return next(new Error("Account was not found or frozen", { cause: 404 }));
  }

  const message = await messageModel.create({
    content,
    userId,
  });

  return res.status(201).json({
    message: "Message is created successfully",
    message,
  });
};

export const listMessages = async (req, res, next) => {
  // find = All messages & findOne = only one message
  const userMessages = await messageModel.find({ userId: req?.userAuth?._id }).populate({
    path:"userId",
    select:"name email"
  })

  return res.status(201).json({
    message: "Done",
    userMessages,
  });
};

export const getOneMessage = async (req, res, next) => {
  const { id } = req.params;

  // find = All messages & findOne = only one message
  const myMessage= await messageModel.findOne({userId: req?.userAuth?._id, _id:id});

  if (!myMessage){
      return next(new Error("Message was not found", { cause: 404 }));
  }

  return res.status(201).json({
    message: "Done",
    myMessage,
  });
};
