/**
 * Test UC007 - Admin Order Management API
 * Chạy: node scripts/test_admin_orders.js
 * Cần backend đang chạy (npm run dev). Đổi ADMIN_EMAIL và ADMIN_PASSWORD nếu khác.
 */

require('dotenv').config();
const http = require('http');

const BASE = 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
    if (body && (method === 'POST' || method === 'PUT')) {
      const data = JSON.stringify(body);
      opts.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(opts, (res) => {
      let raw = '';
      res.on('data', (c) => raw += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: raw ? JSON.parse(raw) : {} });
        } catch {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    if (body && (method === 'POST' || method === 'PUT')) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('=== Test UC007 – Quản lý đơn hàng Admin ===\n');

  // 1. Login admin
  console.log('1. Đăng nhập admin...');
  const loginRes = await request('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const token = loginRes.data?.token || loginRes.data?.data?.token;
  if (loginRes.status !== 200 || !token) {
    console.log('   ❌ Đăng nhập thất bại. Đổi ADMIN_EMAIL/ADMIN_PASSWORD trong script hoặc .env.');
    console.log('   Response:', loginRes.status, loginRes.data);
    process.exit(1);
  }
  console.log('   ✅ Đăng nhập thành công.\n');

  // 2. GET /admin/orders
  console.log('2. GET /admin/orders...');
  const listRes = await request('GET', '/admin/orders', null, token);
  if (listRes.status !== 200) {
    console.log('   ❌ Lỗi:', listRes.status, listRes.data);
    process.exit(1);
  }
  const orders = listRes.data.data || [];
  console.log('   ✅ Số đơn hàng:', orders.length);
  if (orders.length > 0) {
    const o = orders[0];
    console.log('   Ví dụ đơn đầu:', { id: o.id, customer_name: o.customer_name, status: o.status, allowed_statuses: o.allowed_statuses });
  }
  console.log('');

  // 3. PUT status (chỉ khi có đơn PENDING)
  const pending = orders.find((o) => (o.status || '').toUpperCase() === 'PENDING');
  if (pending) {
    console.log('3. PUT /admin/orders/:id/status (PENDING -> PAID)...');
    const putRes = await request('PUT', '/admin/orders/' + pending.id + '/status', { status: 'PAID' }, token);
    if (putRes.status === 200) {
      console.log('   ✅ Cập nhật trạng thái thành công:', putRes.data.message);
    } else {
      console.log('   ❌ Lỗi:', putRes.status, putRes.data?.message || putRes.data);
    }
    // Test chuyển sai (PAID -> CANCELLED hoặc lại PAID tùy DB)
    console.log('\n4. Test chuyển trạng thái không hợp lệ (PAID -> PENDING)...');
    const badRes = await request('PUT', '/admin/orders/' + pending.id + '/status', { status: 'PENDING' }, token);
    if (badRes.status === 400 && badRes.data?.message) {
      console.log('   ✅ Backend trả 400 đúng:', badRes.data.message);
    } else {
      console.log('   Response:', badRes.status, badRes.data);
    }
  } else {
    console.log('3. Không có đơn PENDING để test PUT status. Bỏ qua.');
  }

  console.log('\n=== Kết thúc test ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Lỗi:', err.message);
  if (err.code === 'ECONNREFUSED') console.error('   Kiểm tra backend đang chạy: npm run dev tại thư mục backend.');
  process.exit(1);
});
