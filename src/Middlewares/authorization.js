import { userRole } from "../DB/Models/user.model.js";

export const authorization = (accessRole=[]) => {
  return (req, res, next) => {
    if (!accessRole.includes(req?.userAuth?.role)) {
        console.log(accessRole.includes(req?.userAuth?.role))
      return res.status(401).json({ message: "user is not authorized" });
    }
  
    return next();
  };
};
