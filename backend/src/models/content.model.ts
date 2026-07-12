import mongoose, { Schema } from "mongoose";

const ContentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    type: { type: String, required: true },
    category: { type: String, default: "General" },
    favorite: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["To Read", "Reading", "Completed"],
      default: "To Read",
    },
    tags: { type: [String], default: [] },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const ContentModel = mongoose.model("Content", ContentSchema);
export default ContentModel;
