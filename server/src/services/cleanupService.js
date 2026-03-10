const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const db = require("../db");

// Runs every day at 12:00 AM
const startCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running nightly cleanup...");

    try {
      // 1️⃣ Get all uploaded files
      const [results] = await db.query("SELECT filePath FROM uploads");

      // 2️⃣ Delete files from folder
      for (const file of results) {
        const absolutePath = path.resolve(file.filePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log("Deleted:", absolutePath);
        }
      }

      // 3️⃣ Clear uploads table
      await db.query("DELETE FROM uploads");

      console.log("Uploads table cleared.");
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });
};

module.exports = startCleanupJob;