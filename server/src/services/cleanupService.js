const db = require("../db");

const startCleanupJob = () => {

  // 🧹 Run every 1 hour
  setInterval(async () => {
    try {

      const [result] = await db.execute(
        "DELETE FROM files WHERE status='Printed' AND uploaded_at < NOW() - INTERVAL 1 DAY"
      );

      console.log(`Cleanup complete. Deleted ${result.affectedRows} old files.`);

    } catch (err) {
      console.error("Cleanup job error:", err);
    }

  }, 3600000); // 1 hour
};

module.exports = startCleanupJob;