const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const path = require("path");
const fs = require("fs");
const { decryptFile } = require("../utils/encryption");


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


// 🔹 Manually update file status
router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    await db.execute(
      "UPDATE files SET status = ? WHERE id = ?",
      [req.body.status, req.params.id]
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
});


// 🔹 Download / Preview file
router.get("/download/:id", async (req, res) => {
  try {
    const fileId = req.params.id;

    // 1️⃣ Get file from DB
    const [rows] = await db.execute(
      "SELECT * FROM files WHERE id = ?",
      [fileId]
    );

    if (!rows.length) {
      return res.status(404).send("File not found in DB");
    }

    const file = rows[0];

    const encryptedPath = path.join(
      __dirname,
      "../../uploads",
      file.file_path
    );

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).send("File not found on server");
    }

    const decryptedPath = encryptedPath.replace(".enc", "");

    // 2️⃣ Decrypt file
    await decryptFile(encryptedPath, decryptedPath);

    // 3️⃣ Update status → Printing
    await db.execute(
      "UPDATE files SET status='Printing' WHERE id=?",
      [fileId]
    );

    // 4️⃣ Send PDF preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.file_name}"`
    );

    const stream = fs.createReadStream(decryptedPath);
    stream.pipe(res);

    // 5️⃣ After file finishes streaming
    stream.on("end", async () => {

      // delete decrypted temp file
      if (fs.existsSync(decryptedPath)) {
        fs.unlinkSync(decryptedPath);
      }

      // delete encrypted file (security)
      if (fs.existsSync(encryptedPath)) {
        fs.unlinkSync(encryptedPath);
      }

      // update status → Printed
      await db.execute(
        "UPDATE files SET status='Printed' WHERE id=?",
        [fileId]
      );

      console.log("File printed successfully");
    });

    // handle stream error
    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).send("Error streaming file");
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;