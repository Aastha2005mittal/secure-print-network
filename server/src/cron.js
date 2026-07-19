const cron = require('node-cron');
const cloudinary = require('cloudinary').v2;
const { dbAsync } = require('./db');
const { promisify } = require('util');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function cleanupOldData() {
    try {
        console.log('Running daily cleanup cron job...');
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const dateString = oneDayAgo.toISOString();

        // Find sessions older than 1 day
        const oldSessions = await dbAsync.all(
            `SELECT id FROM UploadSessions WHERE createdAt < ?`,
            [dateString]
        );

        if (oldSessions.length === 0) {
            console.log('No old sessions to cleanup.');
            return;
        }

        const sessionIds = oldSessions.map(s => s.id);
        const placeholders = sessionIds.map(() => '?').join(',');

        // Delete associated files from Cloudinary
        const files = await dbAsync.all(
            `SELECT cloudinaryPublicId FROM Files WHERE uploadSessionId IN (${placeholders})`,
            sessionIds
        );

        for (const file of files) {
            if (file.cloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(file.cloudinaryPublicId);
                    console.log(`Deleted from Cloudinary: ${file.cloudinaryPublicId}`);
                } catch (err) {
                    console.error(`Failed to delete Cloudinary file: ${file.cloudinaryPublicId}`, err);
                }
            }
        }

        // Delete Sessions (Cascades to Files and Messages)
        await dbAsync.run(
            `DELETE FROM UploadSessions WHERE id IN (${placeholders})`,
            sessionIds
        );
        console.log(`Cleanup finished: deleted ${sessionIds.length} sessions.`);
    } catch (error) {
        console.error('Cron job error:', error);
    }
}

// Run every day at midnight
cron.schedule('0 0 * * *', cleanupOldData);

module.exports = { cleanupOldData };