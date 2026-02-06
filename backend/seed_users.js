// Script thêm 10 người dùng mẫu
// Chạy: node seed_users.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const UserModel = require('./src/models/UserModel');

const SAMPLE_PASSWORD = '123456'; // Mật khẩu chung cho tất cả user mẫu

const SAMPLE_USERS = [
  { name: 'Nguyễn Văn An', email: 'nguyenvanan@example.com', phone: '0901234567', role: 'CUSTOMER' },
  { name: 'Trần Thị Bình', email: 'tranthibinh@example.com', phone: '0912345678', role: 'CUSTOMER' },
  { name: 'Lê Văn Cường', email: 'levancuong@example.com', phone: '0923456789', role: 'CUSTOMER' },
  { name: 'Phạm Thị Dung', email: 'phamthidung@example.com', phone: '0934567890', role: 'CUSTOMER' },
  { name: 'Hoàng Minh Đức', email: 'hoangminhduc@example.com', phone: '0945678901', role: 'CUSTOMER' },
  { name: 'Vũ Thị Hương', email: 'vuthihuong@example.com', phone: '0956789012', role: 'CUSTOMER' },
  { name: 'Đặng Văn Khoa', email: 'dangvankhoa@example.com', phone: '0967890123', role: 'CUSTOMER' },
  { name: 'Bùi Thị Lan', email: 'buithilan@example.com', phone: '0978901234', role: 'CUSTOMER' },
  { name: 'Đỗ Minh Tuấn', email: 'dominhtuan@example.com', phone: '0989012345', role: 'CUSTOMER' },
  { name: 'Admin Phụ', email: 'admin2@example.com', phone: '0990123456', role: 'ADMIN' }
];

async function seedUsers() {
  try {
    const existing = await UserModel.findAll();
    const toAdd = SAMPLE_USERS.filter(
      (u) => !existing.some((e) => e.email === u.email || (e.email && e.email.toLowerCase() === u.email.toLowerCase()))
    );

    if (toAdd.length === 0) {
      console.log('✅ Đã có đủ user mẫu (hoặc email trùng). Không thêm mới.');
      process.exit(0);
      return;
    }

    const password_hash = await bcrypt.hash(SAMPLE_PASSWORD, 10);
    let added = 0;

    for (const u of toAdd) {
      try {
        await UserModel.create({
          name: u.name,
          email: u.email.toLowerCase(),
          password_hash,
          phone: u.phone || null,
          role: u.role || 'CUSTOMER'
        });
        added++;
        console.log(`   + ${u.name} (${u.email})`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('Duplicate')) {
          console.log(`   ⏭ Bỏ qua (email đã tồn tại): ${u.email}`);
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✅ Đã thêm ${added} người dùng mẫu. Mật khẩu chung: ${SAMPLE_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

seedUsers();
