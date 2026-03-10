const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const db = require("../db");
const { encryptFile } = require("../utils/encryption");
const fs = require("fs");

// ================= MULTER CONFIG =================
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDFs allowed"));
    }
  },
});

// ================= UPLOAD ENDPOINT =================
// POST /api/upload/:shopId
router.post("/:shopId", upload.array("files", 10), async (req, res) => {
  try {
    const { shopId } = req.params;

    // Check if shop exists
    const [shop] = await db.query(
      "SELECT * FROM shops WHERE shopId = ?",
      [shopId]
    );

    if (shop.length === 0) {
      return res.status(404).json({ message: "Invalid shop ID" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const originalPath = file.path;
      const encryptedPath = originalPath + ".enc";

      // Encrypt file
      await encryptFile(originalPath, encryptedPath);

      // Delete original file
      if (fs.existsSync(originalPath)) {
        fs.unlinkSync(originalPath);
      }

      const fileId = uuidv4();

      // Save to DB
      await db.query(
        `INSERT INTO files 
        (id, shopId, file_name, file_path, uploaded_at) 
        VALUES (?, ?, ?, ?, NOW())`,
        [
          fileId,
          shopId,
          file.originalname,
          path.basename(encryptedPath),
        ]
      );

      uploadedFiles.push({
        id: fileId,
        fileName: file.originalname,
        status: "uploaded",
      });
    }

    res.status(200).json({
      message: "Files uploaded & encrypted successfully",
      files: uploadedFiles,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;