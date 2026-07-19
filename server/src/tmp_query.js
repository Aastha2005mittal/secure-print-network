const { dbAsync } = require('./db');

async function check() {
    try {
        const messages = await dbAsync.all("SELECT * FROM Messages WHERE messageType = 'file' OR content LIKE '%cloudinary%'");
        console.log(JSON.stringify(messages, null, 2));

        // Let's also verify UploadSessions
        const sessions = await dbAsync.all("SELECT * FROM UploadSessions");
        console.log("SESSIONS:\n", JSON.stringify(sessions, null, 2));
    } catch (e) { console.error(e) }
}

check();