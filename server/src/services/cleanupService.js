const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const db = require("../db");

// Runs every day at 12:00 AM
const startCleanupJob = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("Running nightly cleanup...");

    // 1️⃣ Get all uploaded files
    db.query("SELECT filePath FROM uploads", (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return;
      }

      // 2️⃣ Delete files from folder
      results.forEach((file) => {
        const absolutePath = path.resolve(file.filePath);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log("Deleted:", absolutePath);
        }
      });

      // 3️⃣ Clear uploads table
      db.query("DELETE FROM uploads", (err) => {
        if (err) console.error("Error clearing uploads table:", err);
        else console.log("Uploads table cleared.");
      });
    });
  });
};

module.exports = startCleanupJob;