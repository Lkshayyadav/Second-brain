import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("Error: MONGO_URI is not defined in the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error: MongoDB connection failed:", error);
    process.exit(1);
  }
};
