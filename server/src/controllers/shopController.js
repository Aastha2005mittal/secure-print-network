const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

exports.createShop = async (req, res) => {
  try {
    const { shopName, password } = req.body;

    if (!shopName || !password) {
      return res.status(400).json({ message: "Shop name & password required" });
    }

    const shopId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO shops (shopId, shopName, password) VALUES (?, ?, ?)",
      [shopId, shopName, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ message: "DB error" });

        res.status(201).json({
          success: true,
          shopId
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};