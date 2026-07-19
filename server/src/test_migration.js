require('dotenv').config();
const { dbAsync } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function runTests() {
  console.log('--- STARTING POSTGRESQL MIGRATION TESTS ---');

  try {
    // 1. Test Select/Check Tables
    console.log('1. Checking connection and tables existence...');
    const tables = await dbAsync.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in DB:', tables.map(t => t.table_name));

    // 2. Test Transaction and camelCase Mapping on Shop/Room creation
    console.log('\n2. Testing transaction and camelCase key mapping...');
    const shopId = uuidv4();
    const uniqueCode = 'test-' + Math.random().toString(36).substring(2, 8);
    
    const shop = await dbAsync.transaction(async () => {
      const shopResult = await dbAsync.get(
        'INSERT INTO Shops (id, name, uniqueCode, ownerEmail, ownerPassword) VALUES (?, ?, ?, ?, ?) RETURNING id, name, uniqueCode, ownerEmail, createdAt',
        [shopId, 'Test Shop Name', uniqueCode, 'test-owner@example.com', 'test-password-hash']
      );

      const roomId = uuidv4();
      await dbAsync.run(
        'INSERT INTO Rooms (id, shopId) VALUES (?, ?)',
        [roomId, shopId]
      );

      return shopResult;
    });

    console.log('Successfully created shop and room in a transaction.');
    console.log('Returned shop object keys & values:', shop);

    // Verify key mappings
    if (shop.uniqueCode !== uniqueCode) {
      throw new Error(`Mapping failed: uniqueCode expected ${uniqueCode}, got ${shop.uniqueCode}`);
    }
    if (shop.ownerEmail !== 'test-owner@example.com') {
      throw new Error(`Mapping failed: ownerEmail expected test-owner@example.com, got ${shop.ownerEmail}`);
    }
    if (!shop.createdAt) {
      throw new Error(`Mapping failed: createdAt date not returned`);
    }
    console.log('✓ camelCase mapping checks passed!');

    // 3. Test Transaction Rollback
    console.log('\n3. Testing transaction rollback...');
    try {
      await dbAsync.transaction(async () => {
        await dbAsync.run(
          'INSERT INTO Shops (id, name, uniqueCode, ownerEmail, ownerPassword) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), 'Rollback Shop', 'roll-code', 'rollback@example.com', 'pwd']
        );
        // Intentionally trigger a duplicate uniqueCode error or key constraint failure
        await dbAsync.run(
          'INSERT INTO Shops (id, name, uniqueCode, ownerEmail, ownerPassword) VALUES (?, ?, ?, ?, ?)',
          [uuidv4(), 'Rollback Shop 2', 'roll-code', 'rollback@example.com', 'pwd']
        );
      });
      throw new Error('Should have failed transaction due to unique constraint');
    } catch (err) {
      console.log('Transaction successfully rolled back. Error caught:', err.message);
    }

    // 4. Test RETURNING * and boolean/integer behaviour
    console.log('\n4. Testing RETURNING * and isRead (integer) logic...');
    const sessId = uuidv4();
    // Setup Room
    const rooms = await dbAsync.all('SELECT id FROM Rooms WHERE shopId = ?', [shopId]);
    const roomId = rooms[0].id;
    // Insert Session
    await dbAsync.run(
      'INSERT INTO UploadSessions (id, roomId, customerName) VALUES (?, ?, ?)',
      [sessId, roomId, 'Customer Name']
    );
    // Insert Message using RETURNING *
    const msgId = uuidv4();
    const message = await dbAsync.get(
      'INSERT INTO Messages (id, uploadSessionId, senderType, messageType, content) VALUES (?, ?, ?, ?, ?) RETURNING *',
      [msgId, sessId, 'customer', 'text', 'Hello secure print network!']
    );
    console.log('Returned message object:', message);
    if (message.uploadSessionId !== sessId) {
      throw new Error(`Mapping failed: uploadSessionId expected ${sessId}, got ${message.uploadSessionId}`);
    }
    if (message.isRead !== 0) {
      throw new Error(`Default isRead should be 0, got ${message.isRead}`);
    }

    // Test UPDATE returning *
    console.log('\n5. Testing UPDATE with RETURNING * and isRead logic...');
    const updatedMsg = await dbAsync.get(
      "UPDATE Messages SET isRead = 1 WHERE id = ? RETURNING *",
      [msgId]
    );
    console.log('Updated message object:', updatedMsg);
    if (updatedMsg.isRead !== 1) {
      throw new Error(`isRead expected 1, got ${updatedMsg.isRead}`);
    }
    console.log('✓ UPDATE with RETURNING * and integer/boolean compatibility check passed!');

    // Cleanup test data
    console.log('\n6. Cleaning up test data...');
    const delRes = await dbAsync.run('DELETE FROM Shops WHERE id = ?', [shopId]);
    console.log('Cleanup completed. Rows affected:', delRes.changes);

    console.log('\n--- ALL TESTS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err);
    process.exit(1);
  }
}

runTests();
