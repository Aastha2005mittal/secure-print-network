const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { customAlphabet } = require('nanoid');
const bcrypt = require('bcryptjs');

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

router.post('/create', async (req, res) => {
    try {
        const { name, ownerEmail, password, ownerPassword } = req.body;
        const pwd = password || ownerPassword;

        if (!name || !ownerEmail || !pwd) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const hashedPassword = await bcrypt.hash(pwd, 10);
        const shopId = uuidv4();
        let uniqueCode;

        // Generate an unique code and verify it does not exist
        while (true) {
            uniqueCode = nanoid();
            const existing = await dbAsync.get('SELECT id FROM Shops WHERE uniqueCode = ?', [uniqueCode]);
            if (!existing) break;
        }

        await dbAsync.run(
            'INSERT INTO Shops (id, name, uniqueCode, ownerEmail, ownerPassword) VALUES (?, ?, ?, ?, ?)',
            [shopId, name, uniqueCode, ownerEmail, hashedPassword]
        );

        const roomId = uuidv4();
        await dbAsync.run(
            'INSERT INTO Rooms (id, shopId) VALUES (?, ?)',
            [roomId, shopId]
        );

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { sub: shopId, email: ownerEmail, role: 'owner', shopId },
            process.env.JWT_SECRET || 'secret'
        );

        const shop = await dbAsync.get('SELECT id, name, uniqueCode, ownerEmail, createdAt FROM Shops WHERE id = ?', [shopId]);
        return res.status(201).json({ access_token: token, shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating shop' });
    }
});

router.get('/upload/:uniqueCode', async (req, res) => {
    try {
        const { uniqueCode } = req.params;

        // Get shop and its associated room in one query or two
        const shop = await dbAsync.get('SELECT id, name FROM Shops WHERE uniqueCode = ?', [uniqueCode]);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const room = await dbAsync.get('SELECT id FROM Rooms WHERE shopId = ?', [shop.id]);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        return res.json({
            roomId: room.id,
            shopName: shop.name,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;