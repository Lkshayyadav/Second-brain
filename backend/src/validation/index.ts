import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const signinSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export const createContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  link: z.string().optional().default(""),
  type: z.string().min(1, "Content type is required"),
  category: z.string().optional().default("General"),
  favorite: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
  status: z.enum(["To Read", "Reading", "Completed"]).optional().default("To Read"),
  tags: z.array(z.string()).optional().default([]),
  collectionId: z.string().nullable().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().optional(),
  link: z.string().optional(),
  type: z.string().min(1, "Content type cannot be empty").optional(),
  category: z.string().optional(),
  favorite: z.boolean().optional(),
  pinned: z.boolean().optional(),
  status: z.enum(["To Read", "Reading", "Completed"]).optional(),
  tags: z.array(z.string()).optional(),
  collectionId: z.string().nullable().optional(),
});

export const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
});

export const renameCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
});
