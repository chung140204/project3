// Script to create an admin account for testing
// Run: node create_admin.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function createAdmin() {
  try {
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456', // Plain password
      phone: '0900000000',
      role: 'ADMIN'
    };

    // Check if email already exists
    // Try with 'name' first, fallback to 'full_name' if needed
    let existing;
    try {
      [existing] = await pool.query(
        'SELECT id, name, email, role FROM users WHERE email = ?',
        [adminData.email]
      );
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        // Fallback to full_name if name column doesn't exist
        [existing] = await pool.query(
          'SELECT id, full_name as name, email, role FROM users WHERE email = ?',
          [adminData.email]
        );
      } else {
        throw error;
      }
    }

    if (existing.length > 0) {
      console.log('⚠️  Email đã tồn tại:', adminData.email);
      console.log('\n📝 Thông tin tài khoản hiện tại:');
      console.log('   ID:', existing[0].id);
      console.log('   Name:', existing[0].name);
      console.log('   Email:', existing[0].email);
      console.log('   Role:', existing[0].role);
      console.log('\n💡 Nếu muốn đổi password, hãy cập nhật trong database.');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(adminData.password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [
        adminData.name,
        adminData.email,
        password_hash,
        adminData.phone,
        adminData.role
      ]
    );

    console.log('✅ Tạo tài khoản Admin thành công!');
    console.log('\n📝 Thông tin đăng nhập:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('   Role: ADMIN');
    console.log('   User ID:', result.insertId);
    console.log('\n🔐 Bạn có thể đăng nhập với thông tin trên để truy cập Admin Dashboard.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createAdmin();

