import { Router } from "express";
import { signup, signin, changePassword } from "../controllers/user.controller.js";
import { userMiddleware } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.put("/password", userMiddleware, changePassword);

export default userRouter;
