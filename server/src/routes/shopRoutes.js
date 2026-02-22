const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");
const path = require("path");
const fs = require("fs");

// Download file
router.get("/download/:uploadId", (req, res) => {
  const { uploadId } = req.params;

  const sql = "SELECT fileName, filePath FROM uploads WHERE uploadId = ?";

  db.query(sql, [uploadId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = results[0];
    const absolutePath = path.resolve(file.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File missing on server" });
    }

    res.download(absolutePath, file.fileName);
  });
});


// GET uploads for a shop
router.get("/:shopId/uploads", (req, res) => {
  const { shopId } = req.params;

  const sql = `
    SELECT uploadId, fileName, uploadTime
    FROM uploads
    WHERE shopId = ?
    ORDER BY uploadTime DESC
  `;

  db.query(sql, [shopId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      success: true,
      totalFiles: results.length,
      files: results,
    });
  });
});

router.post("/create", authMiddleware, shopController.createShop);
module.exports = router;