// Script to create a customer account for testing
// Run: node create_customer.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function createCustomer() {
  try {
    const customerData = {
      full_name: 'Nguyễn Văn Khách',
      email: 'customer@test.com',
      password: '123456', // Plain password
      phone: '0901234567',
      role: 'CUSTOMER'
    };

    // Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [customerData.email]
    );

    if (existing.length > 0) {
      console.log('⚠️  Email đã tồn tại:', customerData.email);
      console.log('📝 Thông tin đăng nhập:');
      console.log('   Email:', customerData.email);
      console.log('   Password: 123456');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(customerData.password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (full_name, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [
        customerData.full_name,
        customerData.full_name, // Also set name for backward compatibility
        customerData.email,
        password_hash,
        customerData.phone,
        customerData.role
      ]
    );

    console.log('✅ Tạo tài khoản Customer thành công!');
    console.log('\n📝 Thông tin đăng nhập:');
    console.log('   Email:', customerData.email);
    console.log('   Password:', customerData.password);
    console.log('   Role: CUSTOMER');
    console.log('   User ID:', result.insertId);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

createCustomer();






