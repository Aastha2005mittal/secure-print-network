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
app.use("/upload", uploadRoutes);
app.use("/shop", shopRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Test DB query
db.query("SHOW TABLES", (err, results) => {
  if (err) console.error("DB query error:", err);
  else console.log("Tables in DB:", results);
});

// Start cron job
startCleanupJob();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});