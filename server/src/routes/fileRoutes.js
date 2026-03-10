const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");


// 🔹 Get files by shop
router.get("/shop/:shopId", authMiddleware, async (req, res) => {
  try {
    const [files] = await db.execute(
      "SELECT * FROM files WHERE shopId = ? ORDER BY uploaded_at DESC",
      [req.params.shopId]
    );

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching files" });
  }
});


// 🔹 Update file status to Printed
router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "UPDATE files SET status = 'Printed' WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
});

module.exports = router;