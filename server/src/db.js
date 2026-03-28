const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Create tables for PostgreSQL (replacing SQLite syntax)
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Shops (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        uniqueCode TEXT NOT NULL UNIQUE,
        ownerEmail TEXT NOT NULL,
        ownerPassword TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Rooms (
        id TEXT PRIMARY KEY,
        shopId TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shopId) REFERENCES Shops (id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS UploadSessions (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES Rooms (id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Files (
        id TEXT PRIMARY KEY,
        uploadSessionId TEXT NOT NULL,
        cloudinaryPublicId TEXT NOT NULL,
        fileUrl TEXT NOT NULL,
        fileName TEXT NOT NULL,
        resourceType TEXT NOT NULL DEFAULT 'image',
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadSessionId) REFERENCES UploadSessions (id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Messages (
        id TEXT PRIMARY KEY,
        uploadSessionId TEXT NOT NULL,
        senderType TEXT NOT NULL,
        messageType TEXT NOT NULL DEFAULT 'text',
        content TEXT NOT NULL,
        isRead SMALLINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadSessionId) REFERENCES UploadSessions (id) ON DELETE CASCADE
      )
    `);

    console.log('Connected to PostgreSQL database and verified tables.');
  } catch (err) {
    console.error('Error verifying database tables:', err);
  }
}

// Call createTables immediately to ensure layout
createTables();

// Wrapper for promises to map SQLite commands to PostgreSQL
const replaceQuestionMarks = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

const dbAsync = {
  get: async (sql, params = []) => {
    const { rows } = await pool.query(replaceQuestionMarks(sql), params);
    return rows[0];
  },
  all: async (sql, params = []) => {
    const { rows } = await pool.query(replaceQuestionMarks(sql), params);
    return rows;
  },
  run: async (sql, params = []) => {
    // postgres query returns rowCount for updates/deletes
    const res = await pool.query(replaceQuestionMarks(sql), params);
    return { changes: res.rowCount };
  }
};

module.exports = { db: pool, dbAsync };

