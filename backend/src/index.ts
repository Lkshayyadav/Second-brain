import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/connect.js";
import userRouter from "./routes/user.routes.js";
import contentRouter from "./routes/content.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
if (process.env.FRONTEND_URL) {
  // Strip any trailing slash to prevent mismatch with browser origin
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and listed origins
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());


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
