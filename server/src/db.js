const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const asyncLocalStorage = new AsyncLocalStorage();

const KEY_MAP = {
  uniquecode: 'uniqueCode',
  owneremail: 'ownerEmail',
  ownerpassword: 'ownerPassword',
  createdat: 'createdAt',
  updatedat: 'updatedAt',
  shopid: 'shopId',
  roomid: 'roomId',
  customername: 'customerName',
  uploadsessionid: 'uploadSessionId',
  cloudinarypublicid: 'cloudinaryPublicId',
  fileurl: 'fileUrl',
  filename: 'fileName',
  resourcetype: 'resourceType',
  sendertype: 'senderType',
  messagetype: 'messageType',
  isread: 'isRead',
  unreadcount: 'unreadCount',
};

function mapRowKeys(row) {
  if (!row) return row;
  const mapped = {};
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase();
    const mappedKey = KEY_MAP[lowerKey] || key;
    mapped[mappedKey] = row[key];
  }
  return mapped;
}

function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

async function getClient() {
  const store = asyncLocalStorage.getStore();
  if (store && store.client) {
    return store.client;
  }
  return pool;
}

const dbAsync = {
  get: async (sql, params = []) => {
    const client = await getClient();
    const convertedSql = convertSql(sql);
    const result = await client.query(convertedSql, params);
    return result.rows.length > 0 ? mapRowKeys(result.rows[0]) : null;
  },
  all: async (sql, params = []) => {
    const client = await getClient();
    const convertedSql = convertSql(sql);
    const result = await client.query(convertedSql, params);
    return result.rows.map(mapRowKeys);
  },
  run: async (sql, params = []) => {
    const client = await getClient();
    const convertedSql = convertSql(sql);
    const result = await client.query(convertedSql, params);
    return { lastID: undefined, changes: result.rowCount };
  },
  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await asyncLocalStorage.run({ client }, callback);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
};

// Initialize database schema
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        uniquecode TEXT NOT NULL UNIQUE,
        owneremail TEXT NOT NULL,
        ownerpassword TEXT NOT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        shopid TEXT NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS uploadsessions (
        id TEXT PRIMARY KEY,
        roomid TEXT NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
        customername TEXT NOT NULL,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        uploadsessionid TEXT NOT NULL REFERENCES uploadsessions (id) ON DELETE CASCADE,
        cloudinarypublicid TEXT NOT NULL,
        fileurl TEXT NOT NULL,
        filename TEXT NOT NULL,
        resourcetype TEXT NOT NULL DEFAULT 'image',
        status TEXT NOT NULL DEFAULT 'pending',
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        uploadsessionid TEXT NOT NULL REFERENCES uploadsessions (id) ON DELETE CASCADE,
        sendertype TEXT NOT NULL,
        messagetype TEXT NOT NULL DEFAULT 'text',
        content TEXT NOT NULL,
        isread INTEGER NOT NULL DEFAULT 0,
        createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables initialized successfully in PostgreSQL.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
}

createTables();

// Mock raw db object to prevent imports from breaking if any exist
const db = {
  run: (sql, params, callback) => {
    dbAsync.run(sql, params).then(res => {
      if (callback) callback(null, res);
    }).catch(err => {
      if (callback) callback(err);
    });
  },
  get: (sql, params, callback) => {
    dbAsync.get(sql, params).then(res => {
      if (callback) callback(null, res);
    }).catch(err => {
      if (callback) callback(err);
    });
  },
  all: (sql, params, callback) => {
    dbAsync.all(sql, params).then(res => {
      if (callback) callback(null, res);
    }).catch(err => {
      if (callback) callback(err);
    });
  },
  serialize: (callback) => {
    callback();
  }
};

module.exports = { db, dbAsync };