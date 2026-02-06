// Chạy migration thêm cột cancelled_at vào bảng orders
// Chạy: node run_migration_cancelled_at.js

require('dotenv').config();
const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function run() {
  const sqlPath = path.join(__dirname, 'database', 'migration_add_cancelled_at.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Đã thêm cột cancelled_at vào bảng orders.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Cột cancelled_at đã tồn tại, không cần thêm.');
    } else {
      console.error('❌ Lỗi:', err.message);
      process.exit(1);
    }
  } finally {
    process.exit(0);
  }
}

run();
