const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

exports.createShop = async (req, res) => {

  console.log("Create Shop API hit");
  console.log("Request body:", req.body);

  try {
    const { shopName, password } = req.body;

    if (!shopName || !password) {
      return res.status(400).json({
        success: false,
        message: "Shop name & password required",
      });
    }

    const [existing] = await db.query(
      "SELECT * FROM shops WHERE shopName = ?",
      [shopName]
    );

    console.log("Existing shop:", existing);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Shop name already exists",
      });
    }

    const shopId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserting shop into database...");

    await db.query(
      "INSERT INTO shops (shopId, shopName, password) VALUES (?, ?, ?)",
      [shopId, shopName, hashedPassword]
    );

    console.log("Shop created successfully:", shopId);

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shopId,
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};