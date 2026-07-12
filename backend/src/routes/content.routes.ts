import { Router } from "express";
import { addContent, getContent, updateContent, deleteContent } from "../controllers/content.controller.js";
import { userMiddleware } from "../middleware/auth.middleware.js";

const contentRouter = Router();

contentRouter.post("/", userMiddleware, addContent);
contentRouter.get("/", userMiddleware, getContent);
contentRouter.put("/", userMiddleware, updateContent);
contentRouter.put("/:contentId", userMiddleware, updateContent);
contentRouter.delete("/", userMiddleware, deleteContent);
contentRouter.delete("/:contentId", userMiddleware, deleteContent);

export default contentRouter;
