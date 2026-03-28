const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('./db');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const { role, uploadSessionId, shopId } = socket.user || {};
        if (role === 'customer' && uploadSessionId) {
            socket.join(uploadSessionId);
            console.log(`Customer socket ${socket.id} joined session ${uploadSessionId}`);
        } else if (role === 'owner' && shopId) {
            socket.join(`shop_${shopId}`);
            console.log(`Owner socket ${socket.id} joined shop shop_${shopId}`);
        } else {
            console.log(`Socket connected without a known role: ${socket.id}`);
        }

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => io;

const emitToSessionAndShop = async (uploadSessionId, eventName, payload) => {
    if (!io) return;
    // Emit to customer
    io.to(uploadSessionId).emit(eventName, payload);
    try {
        const sessionRow = await dbAsync.get('SELECT roomId FROM UploadSessions WHERE id = ?', [uploadSessionId]);
        if (sessionRow) {
            const roomRow = await dbAsync.get('SELECT shopId FROM Rooms WHERE id = ?', [sessionRow.roomId]);
            if (roomRow) {
                // Emit to owner
                io.to(`shop_${roomRow.shopId}`).emit(eventName, payload);
            }
        }
    } catch (e) { console.error('Socket emit error:', e); }
};

module.exports = { initSocket, getIo, emitToSessionAndShop };
