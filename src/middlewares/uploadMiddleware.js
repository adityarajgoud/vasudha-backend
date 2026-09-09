import multer from "multer";

// In-memory buffer upload for direct streaming & validation
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .csv files are supported"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});
