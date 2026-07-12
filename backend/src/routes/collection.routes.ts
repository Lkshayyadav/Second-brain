import { Router } from "express";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collection.controller.js";
import { userMiddleware } from "../middleware/auth.middleware.js";

const collectionRouter = Router();

collectionRouter.get("/", userMiddleware, getCollections);
collectionRouter.post("/", userMiddleware, createCollection);
collectionRouter.put("/:id", userMiddleware, updateCollection);
collectionRouter.delete("/:id", userMiddleware, deleteCollection);

export default collectionRouter;
