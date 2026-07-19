const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const { dbAsync } = require('../db');
const { sessionAuth, ownerAuth } = require('../middleware/auth');
const stream = require('stream');
const https = require('https');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    fileFilter: (req, file, cb) => {
        const allowedExts = /\.(jpg|jpeg|png|pdf|docx|heic|heif|webp)$/i;
        const isAllowedExt = file.originalname.match(allowedExts);
        const isAllowedMime = file.mimetype.match(/^(image\/.*|application\/pdf|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/octet-stream)$/i);

        if (isAllowedExt || isAllowedMime) {
            cb(null, true);
        } else {
            cb(new Error(`File type not supported: ${file.originalname}`));
        }
    }
});

const uploadToCloudinary = (fileBuffer, originalName) => {
    return new Promise((resolve, reject) => {
        let resourceType = 'auto';
        if (originalName.match(/\.(pdf|docx)$/i)) resourceType = 'raw';
        if (originalName.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i)) resourceType = 'image';

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType, folder: 'secure-print-store' },
            (error, result) => {
                if (error) reject(error);
                else resolve({ result, resourceType });
            }
        );

        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);
        bufferStream.pipe(uploadStream);
    });
};

const sendCloudinaryDownload = (res, file) => {
    const safeFileName = file.fileName.replace(/["\r\n]/g, '_');
    const asciiFileName = safeFileName.replace(/[^\x20-\x7E]/g, '_') || 'download';
    const encodedFileName = encodeURIComponent(safeFileName);

    https.get(file.fileUrl, (cloudinaryRes) => {
        if (cloudinaryRes.statusCode < 200 || cloudinaryRes.statusCode >= 300) {
            return res.status(502).json({ message: 'Could not fetch file for download' });
        }

        res.setHeader('Content-Type', cloudinaryRes.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`);
        cloudinaryRes.pipe(res);
    }).on('error', (error) => {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error downloading file' });
        }
    });
};

router.post('/upload/me', sessionAuth, upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const uploadSessionId = req.user.uploadSessionId;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedRecords = [];
        for (const file of files) {
            try {
                const { result, resourceType } = await uploadToCloudinary(file.buffer, file.originalname);
                const fileId = uuidv4();

                const { fileRecord, messageRecord } = await dbAsync.transaction(async () => {
                    const fileRec = await dbAsync.get(
                        `INSERT INTO Files (id, uploadSessionId, cloudinaryPublicId, fileUrl, fileName, resourceType, status)
               VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
                        [fileId, uploadSessionId, result.public_id, result.secure_url, file.originalname, resourceType, 'pending']
                    );

                    const messageId = uuidv4();
                    const fileMessageContent = JSON.stringify({
                        fileId: fileRec.id,
                        fileName: fileRec.fileName,
                        fileUrl: fileRec.fileUrl
                    });
                    const msgRec = await dbAsync.get(
                        'INSERT INTO Messages (id, uploadSessionId, senderType, messageType, content) VALUES (?, ?, ?, ?, ?) RETURNING *',
                        [messageId, uploadSessionId, 'customer', 'file', fileMessageContent]
                    );

                    return { fileRecord: fileRec, messageRecord: msgRec };
                });

                uploadedRecords.push(fileRecord);

                // Broadcast new file to session and shop owners
                const { emitToSessionAndShop } = require('../socket');
                await emitToSessionAndShop(uploadSessionId, 'newFile', fileRecord);
                await emitToSessionAndShop(uploadSessionId, 'newMessage', messageRecord);
            } catch (uploadError) {
                console.error('Error uploading file to cloudinary:', uploadError);
            }
        }

        res.status(201).json(uploadedRecords);
    } catch (error) {
        if (error.message.includes('File type not supported')) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error uploading files' });
    }
});

router.get('/me/:id/download', sessionAuth, async (req, res) => {
    try {
        const file = await dbAsync.get(
            'SELECT * FROM Files WHERE id = ? AND uploadSessionId = ?',
            [req.params.id, req.user.uploadSessionId]
        );

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        sendCloudinaryDownload(res, file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error downloading file' });
    }
});

router.get('/me', sessionAuth, async (req, res) => {
    try {
        const files = await dbAsync.all('SELECT * FROM Files WHERE uploadSessionId = ? ORDER BY createdAt DESC', [req.user.uploadSessionId]);
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/session/:id', ownerAuth, async (req, res) => {
    try {
        const files = await dbAsync.all('SELECT * FROM Files WHERE uploadSessionId = ? ORDER BY createdAt DESC', [req.params.id]);
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/download', ownerAuth, async (req, res) => {
    try {
        const file = await dbAsync.get(
            `SELECT f.*
             FROM Files f
             JOIN UploadSessions us ON f.uploadSessionId = us.id
             JOIN Rooms r ON us.roomId = r.id
             WHERE f.id = ? AND r.shopId = ?`,
            [req.params.id, req.user.shopId]
        );

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        sendCloudinaryDownload(res, file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error downloading file' });
    }
});

router.patch('/:id/printed', ownerAuth, async (req, res) => {
    try {
        const file = await dbAsync.get('UPDATE Files SET status = ? WHERE id = ? RETURNING *', ['printed', req.params.id]);
        res.json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;