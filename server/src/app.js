require('dotenv').config();
const express = require("express");
const db = require('./db'); 
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shopRoutes");

const app = express();

// Middleware to parse JSON
app.use(cors()); 
app.use(express.json());

// Upload routes
app.use("/upload", uploadRoutes);
app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);

// Test DB query
db.query("SHOW TABLES", (err, results) => {
  if (err) console.error("DB query error:", err);
  else console.log("Tables in DB:", results);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});