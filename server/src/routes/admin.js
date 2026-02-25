const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { generateShopQRCode } = require("../services/qrService");

router.post("/create", async (req, res) => {
  const { shopName, password } = req.body;
  const shopId = uuidv4();
  const qrCodePath = await generateShopQRCode(shopId);

  const sql = "INSERT INTO shops (shopId, shopName, qrCode, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [shopId, shopName, qrCodePath, password || null], (err, result) => {
if (err) {
  console.error("DB ERROR:", err);
  return res.status(500).json({ error: err.message });
}
    res.status(200).json({ message: "Shop created", shopId, qrCodePath });
  });
});

module.exports = router;