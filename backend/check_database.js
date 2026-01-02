// Quick script to check database and seed if needed
require('dotenv').config();
const pool = require('./src/config/database');

async function checkAndSeed() {
  try {
    // Check products
    const [products] = await pool.query('SELECT * FROM products');
    console.log('📦 Products in database:', products.length);
    
    if (products.length === 0) {
      console.log('⚠️  No products found. Please run seed.sql');
      console.log('   Run: mysql -u root -p your_database < backend/database/seed.sql');
    } else {
      console.log('✅ Products found:');
      products.forEach(p => {
        console.log(`   ID: ${p.id}, Name: ${p.name}, Price: ${p.price}₫`);
      });
    }

    // Check users
    const [users] = await pool.query('SELECT * FROM users');
    console.log('\n👥 Users in database:', users.length);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please run seed.sql');
    } else {
      console.log('✅ Users found:');
      users.forEach(u => {
        console.log(`   ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
      });
    }

    // Check orders table structure
    const [columns] = await pool.query('DESCRIBE orders');
    const hasCustomerFields = columns.some(col => col.Field === 'customer_name');
    
    console.log('\n🗄️  Orders table:');
    if (hasCustomerFields) {
      console.log('✅ Migration applied - customer fields exist');
    } else {
      console.log('⚠️  Migration NOT applied - run migration_add_customer_fields.sql');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndSeed();




