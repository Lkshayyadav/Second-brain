import "dotenv/config";
import express from "express";
import { connectDB } from "./db/connect.js";
import userRouter from "./routes/user.routes.js";
import contentRouter from "./routes/content.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";


const app = express();

app.use(express.json());

const FRONTEND_URL = process.env.FRONTEND_URL;
// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/collections", collectionRouter);

// Stub for share endpoints (Sharing is intentionally not implemented in this phase)
app.post("/api/v1/share", (req, res) => {
  res.status(501).json({ message: "Sharing is not implemented yet" });
});
app.get("/api/v1/share/:shareId", (req, res) => {
  res.status(501).json({ message: "Sharing is not implemented yet" });
});

// Mount the error handling middleware
app.use(errorHandler);

const startServer = async () => {
  // Connect to database first
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
