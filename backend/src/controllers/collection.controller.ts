import type { Request, Response, NextFunction } from "express";
import CollectionModel from "../models/collection.model.js";
import ContentModel from "../models/content.model.js";
import { createCollectionSchema, renameCollectionSchema } from "../validation/index.js";
import { AppError } from "../middleware/error.middleware.js";

// Helper function to format collection document for frontend parity
export const formatCollection = (doc: any) => ({
  id: doc._id.toString(),
  name: doc.name,
  userId: doc.userId.toString(),
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

export const createCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    const parseResult = createCollectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { name } = parseResult.data;

    const existingCollection = await CollectionModel.findOne({ name, userId: req.userId });
    if (existingCollection) {
      throw new AppError(409, "Collection with this name already exists");
    }

    const newCollection = new CollectionModel({
      name,
      userId: req.userId,
    });
    await newCollection.save();

    res.status(200).json({
      message: "Collection created",
      collection: formatCollection(newCollection),
    });
  } catch (error) {
    next(error);
  }
};

export const getCollections = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    const docs = await CollectionModel.find({ userId: req.userId });

    res.json({
      collections: docs.map(formatCollection),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const collectionId = req.params.id;

  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    if (!collectionId) {
      throw new AppError(400, "Collection ID is required");
    }

    const parseResult = renameCollectionSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues.map((e: any) => e.message).join(", ");
      throw new AppError(400, errMsg);
    }

    const { name } = parseResult.data;

    const duplicateCollection = await CollectionModel.findOne({
      name,
      userId: req.userId,
      _id: { $ne: collectionId },
    });
    if (duplicateCollection) {
      throw new AppError(409, "Another collection already has this name");
    }

    const updated = await CollectionModel.findOneAndUpdate(
      { _id: collectionId, userId: req.userId },
      { $set: { name } },
      { new: true }
    );

    if (!updated) {
      throw new AppError(404, "Collection not found");
    }

    res.status(200).json({
      message: "Collection renamed",
      collection: formatCollection(updated),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const collectionId = req.params.id;

  try {
    if (!req.userId) {
      throw new AppError(403, "You are not logged in");
    }

    if (!collectionId) {
      throw new AppError(400, "Collection ID is required");
    }

    const deleted = await CollectionModel.findOneAndDelete({
      _id: collectionId,
      userId: req.userId,
    });

    if (!deleted) {
      throw new AppError(404, "Collection not found");
    }

    // Clean up content collection references (unset collectionId on items that belonged to this collection)
    await ContentModel.updateMany(
      { collectionId, userId: req.userId },
      { $unset: { collectionId: "" } }
    );

    res.status(200).json({
      message: "Collection deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
