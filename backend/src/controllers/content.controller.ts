import type { Request, Response, NextFunction } from "express";
import ContentModel from "../models/content.model.js";
import { createContentSchema, updateContentSchema } from "../validation/index.js";
import { AppError } from "../middleware/error.middleware.js";

// Helper function to format content document for frontend parity
export const formatContent = (doc: any) => ({
  id: doc._id.toString(),
  _id: doc._id.toString(),
  title: doc.title,
  description: doc.description || "",
  link: doc.link || "",
  type: doc.type,
  category: doc.category,
  favorite: !!doc.favorite,
  pinned: !!doc.pinned,
  status: doc.status || "To Read",
  tags: doc.tags || [],
  collectionId: doc.collectionId ? doc.collectionId.toString() : undefined,
  userId: doc.userId.toString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const addContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    const parseResult = createContentSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { collectionId, ...otherFields } = parseResult.data;

    const newContent = new ContentModel({
      ...otherFields,
      collectionId: collectionId || undefined,
      userId: req.userId,
    });
    await newContent.save();

    res.status(200).json({
      message: "Content added",
      content: formatContent(newContent),
    });
  } catch (error) {
    next(error);
  }
};

export const getContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    const docs = await ContentModel.find({ userId: req.userId });

    res.json({
      content: docs.map(formatContent),
    });
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const contentId = req.params.contentId || req.body.contentId || req.body.id;

  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    if (!contentId) {
      throw new AppError(400, "Content ID is required");
    }

    const parseResult = updateContentSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const updatePayload = { ...parseResult.data };

    // Explicitly handle empty/null collectionId
    if (updatePayload.collectionId === "") {
      updatePayload.collectionId = null;
    }

    const updated = await ContentModel.findOneAndUpdate(
      { _id: contentId, userId: req.userId },
      { $set: updatePayload },
      { new: true }
    );

    if (!updated) {
      throw new AppError(404, "Content not found");
    }

    res.json({
      message: "Content updated",
      content: formatContent(updated),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const contentId = req.params.contentId || req.body.contentId || req.body.id;

  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    if (!contentId) {
      throw new AppError(400, "Content ID is required");
    }

    const deleted = await ContentModel.findOneAndDelete({
      _id: contentId,
      userId: req.userId,
    });

    if (!deleted) {
      throw new AppError(404, "Content not found");
    }

    res.json({
      message: "deleted",
    });
  } catch (error) {
    next(error);
  }
};
