const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Get all shops (Admin only)
router.get("/all", authMiddleware, (req, res) => {
  const sql = `
    SELECT shopId, shopName, qrCode, createdAt
    FROM shops
    ORDER BY createdAt DESC
  `;

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
router.delete("/:shopId", authMiddleware, (req, res) => {
  const { shopId } = req.params;

  const sql = "DELETE FROM shops WHERE shopId = ?";

  db.query(sql, [shopId], (err, result) => {
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
router.get("/:shopId/uploads", authMiddleware, (req, res) => {
  const { shopId } = req.params;

  if (req.user.role === "shop" && req.user.id !== shopId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

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
const { decryptFile } = require("../utils/encryption");
const os = require("os");

router.get("/download/:uploadId", authMiddleware, async (req, res) => {
  const { uploadId } = req.params;

  const sql = "SELECT fileName, filePath FROM uploads WHERE uploadId = ?";

  db.query(sql, [uploadId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = results[0];

    const tempPath = path.join(
      os.tmpdir(),
      "decrypted_" + file.fileName
    );

    await decryptFile(file.filePath, tempPath);

    res.download(tempPath, file.fileName, () => {
      fs.unlinkSync(tempPath); // delete temp after download
    });
  });
});

router.post("/create",shopController.createShop);

router.post("/login", (req, res) => {
  const { shopId, password } = req.body;

  const sql = "SELECT * FROM shops WHERE shopId = ?";

  db.query(sql, [shopId], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const shop = results[0];

    const isMatch = await bcrypt.compare(password, shop.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: shop.shopId,
        role: "shop",
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      shopId: shop.shopId,
      shopName: shop.shopName,
    });
  });
});

module.exports = router;