const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run('PRAGMA foreign_keys = ON;');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS Shops (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        uniqueCode TEXT NOT NULL UNIQUE,
        ownerEmail TEXT NOT NULL,
        ownerPassword TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Rooms (
        id TEXT PRIMARY KEY,
        shopId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shopId) REFERENCES Shops (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS UploadSessions (
        id TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES Rooms (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Files (
        id TEXT PRIMARY KEY,
        uploadSessionId TEXT NOT NULL,
        cloudinaryPublicId TEXT NOT NULL,
        fileUrl TEXT NOT NULL,
        fileName TEXT NOT NULL,
        resourceType TEXT NOT NULL DEFAULT 'image',
        status TEXT NOT NULL DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadSessionId) REFERENCES UploadSessions (id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Messages (
        id TEXT PRIMARY KEY,
        uploadSessionId TEXT NOT NULL,
        senderType TEXT NOT NULL,
        messageType TEXT NOT NULL DEFAULT 'text',
        content TEXT NOT NULL,
        isRead BOOLEAN NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploadSessionId) REFERENCES UploadSessions (id) ON DELETE CASCADE
      )
    `, () => {
      // Lazy migration for existing DB
      db.run("ALTER TABLE Messages ADD COLUMN messageType TEXT NOT NULL DEFAULT 'text'", () => { });
    });
  });
}

// Wrapper for promises to use with async/await
const dbAsync = {
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  }),
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),
  run: (sql, params = []) => new Promise((resolve, reject) => {
    // using function(err) to retain 'this' binding (this.lastID, this.changes)
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  }),
};

module.exports = { db, dbAsync };