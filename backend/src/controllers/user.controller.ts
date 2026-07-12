import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import { signupSchema, signinSchema, changePasswordSchema } from "../validation/index.js";
import { AppError } from "../middleware/error.middleware.js";

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { username, password } = parseResult.data;

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      throw new AppError(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(200).json({
      message: "User has been created",
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = signinSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { username, password } = parseResult.data;

    const user = await UserModel.findOne({ username });
    if (!user) {
      throw new AppError(403, "Incorrect credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(403, "Incorrect credentials");
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError(500, "JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      jwtSecret
    );

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    const parseResult = changePasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { oldPassword, newPassword } = parseResult.data;

    const user = await UserModel.findById(req.userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(403, "Incorrect current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
export default { signup, signin, changePassword };
