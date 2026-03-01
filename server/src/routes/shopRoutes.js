const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shopController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { decryptFile } = require("../utils/encryption");
const os = require("os");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Get all shops (Admin only)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT shopId, shopName, qrCode, createdAt
      FROM shops
      ORDER BY createdAt DESC
    `);

    res.status(200).json({
      success: true,
      totalShops: results.length,
      shops: results,
    });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Delete shop (Admin only)
router.delete("/:shopId", authMiddleware, async (req, res) => {
  const { shopId } = req.params;

  try {
    const [result] = await db.query("DELETE FROM shops WHERE shopId = ?", [shopId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ message: "Shop deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// GET uploads for a shop
router.get("/:shopId/uploads", authMiddleware, async (req, res) => {
  const { shopId } = req.params;

  if (req.user.role === "shop" && req.user.id !== shopId) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  try {
    const [results] = await db.query(`
      SELECT uploadId, fileName, uploadTime
      FROM uploads
      WHERE shopId = ?
      ORDER BY uploadTime DESC
    `, [shopId]);

    res.status(200).json({
      success: true,
      totalFiles: results.length,
      files: results,
    });
  } catch (err) {
    res.status(500).json({ message: "Database error" });
  }
});

// Download file
router.get("/download/:uploadId", authMiddleware, async (req, res) => {
  const { uploadId } = req.params;

  try {
    const [results] = await db.query(
      "SELECT fileName, filePath FROM uploads WHERE uploadId = ?",
      [uploadId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = results[0];
    const tempPath = path.join(os.tmpdir(), "decrypted_" + file.fileName);

    await decryptFile(file.filePath, tempPath);

    res.download(tempPath, file.fileName, () => {
      fs.unlinkSync(tempPath);
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create shop
router.post("/create", shopController.createShop);

// Shop login
router.post("/login", async (req, res) => {
  const { shopId, password } = req.body;

  if (!shopId || !password) {
    return res.status(400).json({ message: "shopId and password are required" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM shops WHERE shopId = ?",
      [shopId]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const shop = results[0];

    const isMatch = await bcrypt.compare(password, shop.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: shop.shopId, role: "shop" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      shopId: shop.shopId,
      shopName: shop.shopName,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;