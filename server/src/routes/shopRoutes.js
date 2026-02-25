const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");
const path = require("path");
const fs = require("fs");


// Get all shops (Admin only)
router.get("/all", authMiddleware, (req, res) => {
  const sql = "SELECT id, shop_name, created_at FROM shops ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    res.status(200).json({
      success: true,
      totalShops: results.length,
      shops: results,
    });
  });
});

// Delete shop (Admin only)
router.delete("/:id", authMiddleware, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM shops WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ message: "Shop deleted successfully" });
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

router.post("/create", authMiddleware, shopController.createShop);

router.post("/login", (req, res) => {
  const { shopId, password } = req.body;

  const sql = "SELECT * FROM shops WHERE shopId = ? AND password = ?";

  db.query(sql, [shopId, password], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      shopId: results[0].id,
      shopName: results[0].shop_name,
    });
  });
});

module.exports = router;