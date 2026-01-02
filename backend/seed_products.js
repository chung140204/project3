// Script to seed products into database
// Run: node seed_products.js

require('dotenv').config();
const pool = require('./src/config/database');

async function seedProducts() {
  try {
    // Check if products already exist
    const [existingProducts] = await pool.query('SELECT COUNT(*) as count FROM products');
    
    if (existingProducts[0].count > 0) {
      console.log(`✅ Database đã có ${existingProducts[0].count} sản phẩm.`);
      
      // Show existing products
      const [products] = await pool.query('SELECT id, name, price, stock FROM products');
      console.log('\n📦 Danh sách sản phẩm hiện có:');
      products.forEach(p => {
        console.log(`   - ${p.name} (${p.price}₫, Stock: ${p.stock})`);
      });
      process.exit(0);
    }

    console.log('📦 Đang tạo sản phẩm mẫu...');

    // First, ensure categories exist
    const [categories] = await pool.query('SELECT id, name FROM categories');
    
    if (categories.length === 0) {
      console.log('⚠️  Chưa có categories. Đang tạo categories...');
      await pool.query(`
        INSERT INTO categories (name, tax_rate) VALUES
        ('Áo', 0.10),
        ('Quần', 0.10),
        ('Phụ kiện', 0.05)
      `);
      console.log('✅ Đã tạo categories.');
    }

    // Get category IDs
    const [updatedCategories] = await pool.query('SELECT id, name FROM categories');
    const categoryMap = {};
    updatedCategories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Insert products
    const products = [
      {
        name: 'Áo thun nam',
        description: 'Áo thun nam chất liệu cotton 100%, thoáng mát, phù hợp mùa hè',
        price: 200000,
        stock: 50,
        status: 'ACTIVE',
        sku: 'PROD-AO-001',
        category_id: categoryMap['Áo']
      },
      {
        name: 'Quần jean nữ',
        description: 'Quần jean nữ form slim, chất liệu denim cao cấp, nhiều size',
        price: 350000,
        stock: 30,
        status: 'ACTIVE',
        sku: 'PROD-QUAN-001',
        category_id: categoryMap['Quần']
      },
      {
        name: 'Nón lưỡi trai',
        description: 'Nón lưỡi trai thời trang, chống nắng, nhiều màu sắc',
        price: 100000,
        stock: 100,
        status: 'ACTIVE',
        sku: 'PROD-PK-001',
        category_id: categoryMap['Phụ kiện']
      }
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, description, price, stock, status, sku, category_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.status,
          product.sku,
          product.category_id
        ]
      );
    }

    console.log('✅ Đã tạo thành công 3 sản phẩm mẫu!');
    console.log('\n📦 Danh sách sản phẩm:');
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.price}₫)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedProducts();



