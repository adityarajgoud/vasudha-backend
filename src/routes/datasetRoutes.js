import express from "express";
import {
  uploadDataset,
  getMyDatasets,
  getAllDatasets,
  updateDatasetStatus,
  updateDatasetDetails,
  deleteDataset,
} from "../controllers/datasetController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Admin endpoints
router.post(
  "/upload",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  uploadDataset,
);
router.get("/my", protect, authorize("ADMIN", "SUPER_ADMIN"), getMyDatasets);

// Super Admin review & management endpoints
router.get("/all", protect, authorize("SUPER_ADMIN"), getAllDatasets);
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN"),
  updateDatasetStatus,
);
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  upload.single("file"),
  updateDatasetDetails,
);
router.delete("/:id", protect, authorize("SUPER_ADMIN"), deleteDataset);

export default router;
