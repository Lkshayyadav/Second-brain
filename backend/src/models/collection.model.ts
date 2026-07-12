import mongoose, { Schema } from "mongoose";

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Enforce unique collection names per user
CollectionSchema.index({ name: 1, userId: 1 }, { unique: true });

export const CollectionModel = mongoose.model("Collection", CollectionSchema);
export default CollectionModel;
