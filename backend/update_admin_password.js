// Script to update admin password
// Run: node update_admin_password.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function updateAdminPassword() {
  try {
    const adminEmail = 'admin@example.com';
    const newPassword = '123456'; // New password

    // Check if admin exists
    let [existing] = await pool.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [adminEmail]
    );

    if (existing.length === 0) {
      console.log('❌ Không tìm thấy tài khoản admin với email:', adminEmail);
      console.log('💡 Hãy chạy: node create_admin.js để tạo tài khoản admin mới');
      process.exit(1);
    }

    const admin = existing[0];
    if (admin.role !== 'ADMIN') {
      console.log('⚠️  Tài khoản này không phải ADMIN:', adminEmail);
      console.log('   Role hiện tại:', admin.role);
      process.exit(1);
    }

    // Hash new password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [password_hash, adminEmail]
    );

    console.log('✅ Cập nhật password cho Admin thành công!');
    console.log('\n📝 Thông tin đăng nhập:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', newPassword);
    console.log('   Role: ADMIN');
    console.log('   User ID:', admin.id);
    console.log('\n🔐 Bạn có thể đăng nhập với thông tin trên để truy cập Admin Dashboard.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateAdminPassword();





