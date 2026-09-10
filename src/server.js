import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { seedSuperAdmin } from "./utils/seedSuperAdmin.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();

const app = express();

// Dynamically handle local Vite ports (5173, 5174, etc.) and remote client URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked by server"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/public", publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedSuperAdmin();
  app.listen(PORT, () => {
    console.log(`[Server] Vasudha API is running on http://localhost:${PORT}`);
  });
};

startServer();
