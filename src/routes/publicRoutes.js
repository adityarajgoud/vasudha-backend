import express from "express";
import { getPublicDatasets } from "../controllers/datasetController.js";

const router = express.Router();

// Completely open endpoints for landing page & domain routes
router.get("/datasets", getPublicDatasets);

export default router;
