const express = require("express");
const router = express.Router();
const db = require("../db");

// GET uploads for a shop
router.get("/:shopId/uploads", (req, res) => {
  const { shopId } = req.params;

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

module.exports = router;