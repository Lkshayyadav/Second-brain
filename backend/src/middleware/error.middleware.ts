import type { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If it's a known AppError, return it directly
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    res.status(409).json({ message: "Duplicate resource already exists" });
    return;
  }

  // Handle Zod validation errors if thrown/passed
  if (err.name === "ZodError" || err.issues) {
    const messages = err.issues ? err.issues.map((i: any) => i.message).join(", ") : err.message;
    res.status(400).json({ message: messages });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
};
