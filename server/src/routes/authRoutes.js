const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbAsync } = require('../db');

router.post('/owner/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Using parameterization to avoid SQL Injection
        const shop = await dbAsync.get('SELECT * FROM Shops WHERE ownerEmail = ?', [email]);
        if (!shop) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, shop.ownerPassword);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { sub: shop.id, email: shop.ownerEmail, role: 'owner', shopId: shop.id },
            process.env.JWT_SECRET || 'secret'
        );

        res.json({ access_token: token, shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
