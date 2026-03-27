require("dotenv").config();
const express = require("express");
const db = require("./db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const uploadRoutes = require("./routes/uploadRoutes");
const shopRoutes = require("./routes/shopRoutes");
const startCleanupJob = require("./services/cleanupService");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/uploads", express.static("uploads"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/upload", uploadRoutes);
app.use("/shop", shopRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// ================= DB CHECK =================
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("DB Connected ✅");
  } catch (err) {
    console.error("DB Connection Failed ❌", err);
  }
})();

// ================= CRON =================
startCleanupJob();

// ================= SOCKET.IO SETUP =================

// ❗ IMPORTANT: use http server
const server = http.createServer(app);

// ❗ attach socket
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join shop room
  socket.on("join_room", (shopId) => {
    socket.join(shopId);
    console.log(`Socket ${socket.id} joined room ${shopId}`);
  });

  // Receive & broadcast message
  socket.on("send_message", (data) => {
    io.to(data.shopId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

// ❗ IMPORTANT: use server.listen NOT app.listen
server.listen(PORT, () => {
  console.log(`Server running with Socket.IO on port ${PORT}`);
});