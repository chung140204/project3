/**
 * Test script for return/refund flow
 * Run: API_BASE_URL=http://localhost:5000/api node scripts/test-return-refund-flow.js
 *
 * Required env: API_BASE_URL (e.g. http://localhost:5000/api)
 * Optional: CUSTOMER_EMAIL, CUSTOMER_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
 * When GET /api/orders is not available: ORDER_ID (ID of a COMPLETED order with returnStatus=NONE)
 *
 * Dependencies: npm install form-data (for multipart upload)
 */

require('dotenv').config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const API_BASE_URL = process.env.API_BASE_URL;
const CUSTOMER_EMAIL = process.env.CUSTOMER_EMAIL || 'customer@example.com';
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD || '123456';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const ORDER_ID = process.env.ORDER_ID;

if (!API_BASE_URL) {
  console.error('❌ API_BASE_URL is required. Example: API_BASE_URL=http://localhost:5000/api node scripts/test-return-refund-flow.js');
  process.exit(1);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

let userToken = null;
let adminToken = null;
let orderId = null;

function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

async function step1_LoginUser() {
  log(1, 'Login user');
  const res = await api.post('/auth/login', {
    email: CUSTOMER_EMAIL,
    password: CUSTOMER_PASSWORD
  });
  if (res.data.success && res.data.data?.token) {
    userToken = res.data.data.token;
    console.log('   ✓ User token obtained');
  } else {
    throw new Error('Login user failed: ' + (res.data.error || 'No token'));
  }
}

async function step2_LoginAdmin() {
  log(2, 'Login admin');
  const res = await api.post('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  if (res.data.success && res.data.data?.token) {
    adminToken = res.data.data.token;
    console.log('   ✓ Admin token obtained');
  } else {
    throw new Error('Login admin failed: ' + (res.data.error || 'No token'));
  }
}

async function step3_FindCompletedOrder() {
  log(3, 'Find completed order');

  if (ORDER_ID) {
    try {
      const res = await api.get(`/orders/${ORDER_ID}/invoice`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        if (d.status === 'COMPLETED' && (d.returnStatus || d.return_status || 'NONE') === 'NONE') {
          orderId = parseInt(ORDER_ID);
          console.log(`   ✓ Using ORDER_ID from env: ${orderId}`);
          return;
        }
        throw new Error(`Order ${ORDER_ID} not eligible: status=${d.status}, returnStatus=${d.returnStatus ?? d.return_status}`);
      }
    } catch (e) {
      if (e.response?.status === 404) {
        throw new Error(`Order ${ORDER_ID} not found`);
      }
      throw e;
    }
  }

  try {
    const res = await api.get('/orders', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const orders = res.data?.orders ?? res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
    const found = orders.find(
      (o) => o.status === 'COMPLETED' && (o.return_status || o.returnStatus || 'NONE') === 'NONE'
    );
    if (found) {
      orderId = found.id;
      console.log(`   ✓ Found order #${orderId}`);
    } else {
      throw new Error('No eligible order');
    }
  } catch (err) {
    if (err.response?.status === 404 || err.code === 'ERR_BAD_REQUEST') {
      if (ORDER_ID) {
        throw new Error(`ORDER_ID=${ORDER_ID} not found or not eligible. Set ORDER_ID to a COMPLETED order with returnStatus=NONE.`);
      }
      console.log('   Không có đơn đủ điều kiện test return');
      console.log('   Set ORDER_ID env to a COMPLETED order ID. Example: ORDER_ID=1 node scripts/test-return-refund-flow.js');
      process.exit(1);
    }
    throw err;
  }
}

async function step4_SendReturnRequest() {
  log(4, 'Send return request');

  const assetsDir = path.join(__dirname, 'assets');
  const testImagePath = path.join(assetsDir, 'test-image.png');

  if (!fs.existsSync(testImagePath)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(testImagePath, minimalPng);
  }

  let formData;
  try {
    const FormDataPkg = require('form-data');
    formData = new FormDataPkg();
    formData.append('reason', 'Test return request');
    formData.append('media', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
  } catch (e) {
    console.error('   Install form-data: npm install form-data');
    throw new Error('form-data package required. Run: npm install form-data');
  }

  const res = await api.post(`/orders/${orderId}/return-request`, formData, {
    headers: {
      Authorization: `Bearer ${userToken}`,
      ...formData.getHeaders()
    }
  });

  if (res.data.success) {
    console.log('   ✓ Return request sent');
  } else {
    throw new Error(res.data.error || 'Send return request failed');
  }
}

async function step5_CheckInvoice() {
  log(5, 'Check invoice');
  const res = await api.get(`/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (res.data.success && res.data.data) {
    const d = res.data.data;
    console.log('   status:', d.status);
    console.log('   returnStatus:', d.returnStatus ?? d.return_status ?? 'N/A');
    console.log('   refundedAt:', d.refundedAt ?? d.refunded_at ?? 'null');
  } else {
    throw new Error('Get invoice failed');
  }
}

async function step6_ApproveReturn() {
  log(6, 'Approve return');
  const res = await api.put(`/admin/orders/${orderId}/return/approve`, {}, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (res.data.success) {
    console.log('   ✓ Return approved');
  } else {
    throw new Error(res.data.error || 'Approve failed');
  }
}

async function step7_CheckInvoiceAgain() {
  log(7, 'Check invoice again');
  const res = await api.get(`/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  if (res.data.success && res.data.data) {
    const d = res.data.data;
    console.log('   status:', d.status);
    console.log('   returnStatus:', d.returnStatus ?? d.return_status ?? 'N/A');
    console.log('   refundedAt:', d.refundedAt ?? d.refunded_at ?? 'null');
    return d;
  } else {
    throw new Error('Get invoice failed');
  }
}

async function main() {
  console.log('\n=== Test Return/Refund Flow ===\n');

  try {
    await step1_LoginUser();
    await step2_LoginAdmin();
    await step3_FindCompletedOrder();
    await step4_SendReturnRequest();
    await step5_CheckInvoice();
    await step6_ApproveReturn();
    const invoice = await step7_CheckInvoiceAgain();

    const returnStatus = invoice.returnStatus ?? invoice.return_status;
    const refundedAt = invoice.refundedAt ?? invoice.refunded_at;

    console.log('\n--- Kết luận ---');
    if (returnStatus === 'APPROVED' && refundedAt != null) {
      console.log('RETURN / REFUND FLOW: OK\n');
    } else {
      console.log('RETURN / REFUND FLOW: FAILED\n');
    }
  } catch (err) {
    console.error('\n❌ Error:', err.response?.data?.error || err.message);
    if (err.response?.data) {
      console.error('   Response:', JSON.stringify(err.response.data));
    }
    process.exit(1);
  }
}

main();
