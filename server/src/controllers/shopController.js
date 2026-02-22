const { v4: uuidv4 } = require("uuid");

exports.createShop = async (req, res) => {
  try {
    const shopName = req.body.shopName;

    if (!shopName) {
      return res.status(400).json({ message: "Shop name is required" });
    }

    const shopId = uuidv4();

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: {
        shopName,
        shopId
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};