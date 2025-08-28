import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./Middlewares/globalErrorHandling.js";
import messageRouter from "./Modules/Messages/message.controller.js";
import userRouter from "./Modules/Users/user.controller.js";
import cors from 'cors';
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet";




var whitelist = ['http://localhost:4200', 'http://localhost:3000'];
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};


const limiter = rateLimit({
	windowMs:  60 * 1000, // 
	max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
message:{
  error:"Too many requests"
}
})




const bootstrap = (app, express) => {
  app.use(cors(corsOptions));
  // app.use(morgan("combined"))
  // Apply the rate limiting middleware to all requests.
  app.use(limiter)
  app.use(helmet());
//* it’s  parsing [ JSON string to JavaScript object]
  app.use(express.json());
  connectDB();

  app.use("/uploads/users/profile", express.static("uploads/users/profile"));
  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  app.all("/*demo", (req, res, next) => {
    throw new Error("Page is not found", { cause: 404 });
  });

  // Error-handling middleware
  app.use(globalErrorHandling);
};

export default bootstrap;