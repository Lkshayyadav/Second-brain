import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers["authorization"];
  if (!header) {
    res.status(403).json({
      message: "You are not logged in",
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("Error: JWT_SECRET is not defined in environment variables");
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  try {
    const decoded = jwt.verify(header, jwtSecret);
    if (decoded) {
      if (typeof decoded === "string") {
        res.status(403).json({
          message: "You are not logged in",
        });
        return;
      }
      req.userId = (decoded as JwtPayload).id;
      next();
    } else {
      res.status(403).json({
        message: "You are not logged in",
      });
    }
  } catch (error) {
    res.status(403).json({
      message: "You are not logged in",
    });
  }
};
export default userMiddleware;
