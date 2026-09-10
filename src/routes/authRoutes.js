import express from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPasswordWithOTP,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithOTP);

export default router;
