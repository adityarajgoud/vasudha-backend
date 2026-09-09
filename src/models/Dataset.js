import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Dataset title is required"],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, "Domain is required"],
      enum: ["Climate", "Energy", "Power"],
    },
    chartType: {
      type: String,
      required: [true, "Chart type is required"],
      enum: ["lat_long_map", "state_heatmap", "line", "bar", "area"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    columns: {
      type: [String],
      required: true,
    },
    data: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalFileName: {
      type: String,
    },
    approvedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

export const Dataset = mongoose.model("Dataset", datasetSchema);
