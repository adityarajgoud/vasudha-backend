import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

// JSON body parser
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// User Routes
app.use("/api/users", userRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `[Server] Vasudha API is running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
