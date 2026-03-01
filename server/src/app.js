require('dotenv').config();
const express = require("express");
const db = require('./db'); 
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const shopRoutes = require("./routes/shopRoutes");
const startCleanupJob = require("./services/cleanupService");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

// Middleware to parse JSON
app.use(cors()); 
app.use(express.json());

// Upload routes
app.use("/uploads", express.static("uploads"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/upload", uploadRoutes);
app.use("/shop", shopRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Test DB query
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("DB Connected ✅");
  } catch (err) {
    console.error("DB Connection Failed ❌", err);
  }
})();

// Start cron job
startCleanupJob();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});