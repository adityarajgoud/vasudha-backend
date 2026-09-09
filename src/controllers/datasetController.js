import { Dataset } from "../models/Dataset.js";
import { validateAndParseCSV } from "../utils/csvValidator.js";

// Admin: Upload new dataset (CSV schema validation & defaults to PENDING)
export const uploadDataset = async (req, res) => {
  try {
    const { title, domain, chartType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a .csv file" });
    }
    if (!title || !domain || !chartType) {
      return res
        .status(400)
        .json({ message: "Title, domain, and chartType are required" });
    }

    // Server-side validation against chart type rules
    const { columns, data } = await validateAndParseCSV(
      req.file.buffer,
      chartType,
    );

    const dataset = await Dataset.create({
      title: title.trim(),
      domain,
      chartType,
      status: "PENDING",
      columns,
      data,
      submittedBy: req.user._id,
      originalFileName: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      message:
        "Dataset submitted successfully and is pending Super Admin approval",
      dataset,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin: Get own datasets
export const getMyDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ submittedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, datasets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Get all datasets (with author info)
export const getAllDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find()
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, datasets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Approve or Reject dataset
export const updateDatasetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be APPROVED or REJECTED" });
    }

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    dataset.status = status;
    if (status === "APPROVED") {
      dataset.approvedAt = new Date();
    } else {
      dataset.approvedAt = null;
    }

    await dataset.save();
    res
      .status(200)
      .json({ success: true, message: `Dataset marked as ${status}`, dataset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Super Admin: Delete dataset
export const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    await dataset.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Dataset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public: Get all approved visualizations sorted by approval order
export const getPublicDatasets = async (req, res) => {
  try {
    const { domain } = req.query;
    const filter = { status: "APPROVED" };

    if (domain) {
      // Capitalize first letter to match domain enum
      const formattedDomain =
        domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase();
      filter.domain = formattedDomain;
    }

    // Sequence: ordered by approval time ascending (or descending as specified)
    const datasets = await Dataset.find(filter)
      .sort({ approvedAt: 1 })
      .select("-submittedBy");

    res.status(200).json({ success: true, count: datasets.length, datasets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Super Admin: Edit dataset details (Title, Domain, Chart Type, or re-parse new CSV)
export const updateDatasetDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, domain, chartType } = req.body;

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    if (title) dataset.title = title.trim();
    if (domain) dataset.domain = domain;
    if (chartType) dataset.chartType = chartType;

    // If an updated CSV file was provided
    if (req.file) {
      const typeToValidate = chartType || dataset.chartType;
      const { columns, data } = await validateAndParseCSV(
        req.file.buffer,
        typeToValidate,
      );
      dataset.columns = columns;
      dataset.data = data;
      dataset.originalFileName = req.file.originalname;
    }

    await dataset.save();

    res.status(200).json({
      success: true,
      message: "Dataset updated successfully",
      dataset,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
