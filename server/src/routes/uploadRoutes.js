const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const db = require("../db"); // create db.js for MySQL connection
const { encryptFile } = require("../utils/encryption");
const fs = require("fs");

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
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const originalPath = req.file.path;              // uploads/abc123
    const encryptedPath = originalPath + ".enc";     // uploads/abc123.enc

    // Encrypt the file
    await encryptFile(originalPath, encryptedPath);

    // Delete original unencrypted file
   if (fs.existsSync(originalPath)) {
  fs.unlinkSync(originalPath);
}

    // Save encryptedPath in DB instead of originalPath
    const filePath = encryptedPath;

    // Example DB insert (modify according to your DB structure)
    // db.query("INSERT INTO files (file_path) VALUES (?)", [filePath]);

    res.status(200).json({
      message: "File uploaded & encrypted successfully",
      filePath
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;