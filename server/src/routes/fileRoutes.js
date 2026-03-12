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

router.get("/download/:id", async (req, res) => {
  try {
    const fileId = req.params.id;

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

    // 🔓 decrypt file
    await decryptFile(encryptedPath, decryptedPath);

    // 📄 headers for PDF preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${file.file_name}"`);

    // 📡 stream file instead of reading fully
    const stream = fs.createReadStream(decryptedPath);
    stream.pipe(res);

    // after stream ends
    stream.on("end", async () => {

      // delete decrypted temp file
      if (fs.existsSync(decryptedPath)) {
        fs.unlinkSync(decryptedPath);
      }

      // update print status
      await db.execute(
        "UPDATE files SET status = 'Printed' WHERE id = ?",
        [fileId]
      );

      console.log("File sent and temp deleted");
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;