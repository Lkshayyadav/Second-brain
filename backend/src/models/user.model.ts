import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", UserSchema);
export default UserModel;
