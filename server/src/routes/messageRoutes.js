const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { dbAsync } = require('../db');
const { sessionAuth, ownerAuth } = require('../middleware/auth');
const { emitToSessionAndShop } = require('../socket');

router.get('/me', sessionAuth, async (req, res) => {
    try {
        const messages = await dbAsync.all(
            'SELECT * FROM Messages WHERE uploadSessionId = ? ORDER BY createdAt ASC',
            [req.user.uploadSessionId]
        );
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/me', sessionAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const uploadSessionId = req.user.uploadSessionId;
        const messageId = uuidv4();

        const message = await dbAsync.get(
            'INSERT INTO Messages (id, uploadSessionId, senderType, messageType, content) VALUES (?, ?, ?, ?, ?) RETURNING *',
            [messageId, uploadSessionId, 'customer', 'text', content]
        );

        // Broadcast via socket.io
        await emitToSessionAndShop(uploadSessionId, 'newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/session/:id', ownerAuth, async (req, res) => {
    try {
        const messages = await dbAsync.all(
            'SELECT * FROM Messages WHERE uploadSessionId = ? ORDER BY createdAt ASC',
            [req.params.id]
        );
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/session/:id', ownerAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const uploadSessionId = req.params.id;
        const messageId = uuidv4();

        const message = await dbAsync.get(
            'INSERT INTO Messages (id, uploadSessionId, senderType, messageType, content) VALUES (?, ?, ?, ?, ?) RETURNING *',
            [messageId, uploadSessionId, 'owner', 'text', content]
        );

        // Broadcast via socket.io
        await emitToSessionAndShop(uploadSessionId, 'newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/read/:id', ownerAuth, async (req, res) => {
    try {
        await dbAsync.run(
            "UPDATE Messages SET isRead = 1 WHERE uploadSessionId = ? AND senderType = 'customer'",
            [req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/read-me', sessionAuth, async (req, res) => {
    try {
        await dbAsync.run(
            "UPDATE Messages SET isRead = 1 WHERE uploadSessionId = ? AND senderType = 'owner'",
            [req.user.uploadSessionId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;