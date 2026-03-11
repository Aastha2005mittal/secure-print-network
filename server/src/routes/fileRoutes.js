const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");
const fs = require("fs");

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

// 🔹 Download file by ID
router.get("/download/:id", async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1️⃣ Get file info from DB
    const [rows] = await db.execute("SELECT * FROM files WHERE id = ?", [fileId]);
    if (!rows[0]) return res.status(404).send("File not found in DB");

    const file = rows[0];

    // 2️⃣ Real path to file on disk
    const filePath = path.join(__dirname, "../../uploads", file.file_path);
    console.log("Looking for file at:", filePath); // <-- debug log

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on server");
    }

    // 3️⃣ Send file to client
    res.download(filePath, file.file_name);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;