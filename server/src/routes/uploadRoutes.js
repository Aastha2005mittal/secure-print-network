const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const db = require("../db"); // create db.js for MySQL connection

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs allowed"));
    }
  },
});

// Upload endpoint
router.post("/:shopId", upload.single("file"), (req, res) => {
  const shopId = req.params.shopId;
  if (!req.file) return res.status(400).send("No file uploaded");

  const fileName = req.file.originalname;
  const filePath = req.file.path;
  const uploadId = uuidv4();

  const sql = "INSERT INTO uploads (uploadId, shopId, fileName, filePath) VALUES (?, ?, ?, ?)";
  db.query(sql, [uploadId, shopId, fileName, filePath], (err, result) => {
    if (err) {
  console.error("DB ERROR:", err);
  return res.status(500).json({ error: err.message });
}
    res.status(200).json({ message: "File uploaded successfully", uploadId });
  });
});

module.exports = router;