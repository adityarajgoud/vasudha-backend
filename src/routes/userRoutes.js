import express from "express";
import {
  getAdmins,
  createAdmin,
  toggleAdminStatus,
  deleteAdmin,
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only Super Admin can manage Admins
router.use(protect, authorize("SUPER_ADMIN"));

router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.patch("/admins/:id/toggle", toggleAdminStatus);
router.delete("/admins/:id", deleteAdmin);

export default router;
