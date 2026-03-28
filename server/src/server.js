require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const fileRoutes = require('./routes/fileRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Services
const { initSocket } = require('./socket');
require('./cron'); // Initialize cron jobs

// Setup Server
const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/messages', messageRoutes);

// Initialize Websockets
initSocket(server);

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
