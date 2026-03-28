const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../db');
const { sessionAuth, ownerAuth } = require('../middleware/auth');

router.post('/create/:roomId', async (req, res) => {
    try {
        const { roomId } = req.params;
        const { customerName } = req.body;

        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        const room = await dbAsync.get('SELECT id, shopId FROM Rooms WHERE id = ?', [roomId]);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const sessionId = uuidv4();
        await dbAsync.run(
            'INSERT INTO UploadSessions (id, roomId, customerName) VALUES (?, ?, ?)',
            [sessionId, roomId, customerName]
        );

        const token = jwt.sign(
            { sub: sessionId, customerName, role: 'customer', uploadSessionId: sessionId, roomId },
            process.env.JWT_SECRET || 'secret'
        );

        res.status(201).json({ token: token, session: { id: sessionId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', sessionAuth, async (req, res) => {
    try {
        const sessionId = req.user.uploadSessionId;
        const session = await dbAsync.get('SELECT * FROM UploadSessions WHERE id = ?', [sessionId]);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // get shop name
        const shopResult = await dbAsync.get(`
      SELECT s.name FROM Shops s 
      JOIN Rooms r ON s.id = r.shopId 
      WHERE r.id = ?
    `, [session.roomId]);

        res.json({
            ...session,
            shop: shopResult ? { name: shopResult.name } : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/owner/list/:shopId', ownerAuth, async (req, res) => {
    try {
        const { shopId } = req.params;
        if (req.user.shopId !== shopId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const rooms = await dbAsync.all('SELECT id FROM Rooms WHERE shopId = ?', [shopId]);
        if (rooms.length === 0) return res.json([]);

        const roomIds = rooms.map(r => r.id);
        const placeholders = roomIds.map(() => '?').join(',');

        const sessions = await dbAsync.all(
            `SELECT * FROM UploadSessions WHERE roomId IN (${placeholders}) ORDER BY createdAt DESC`,
            roomIds
        );

        // Get unread counts
        for (const session of sessions) {
            const counts = await dbAsync.get(
                `SELECT COUNT(*) as unreadCount FROM Messages WHERE uploadSessionId = ? AND isRead = 0 AND senderType = 'customer'`,
                [session.id]
            );
            session.unreadCount = counts ? counts.unreadCount : 0;
        }

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
