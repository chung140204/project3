// Home page component
// Displays hero section, features, and featured products

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import { getProductImage } from '../utils/productImage';

// Mock product data for homepage
const featuredProducts = [
  {
    id: 1,
    name: 'Áo thun nam cao cấp',
    description: 'Chất liệu cotton mềm mại, thoáng khí, phù hợp mọi hoạt động hàng ngày',
    price: 200000,
    tax_rate: 0.10,
    category_name: 'Áo'
  },
  {
    id: 2,
    name: 'Quần jean nữ phong cách',
    description: 'Thiết kế slim fit hiện đại, chất liệu denim bền đẹp, tôn dáng người mặc',
    price: 350000,
    tax_rate: 0.10,
    category_name: 'Quần'
  },
  {
    id: 3,
    name: 'Nón lưỡi trai thời trang',
    description: 'Nón bảo vệ khỏi nắng, thiết kế unisex, nhiều màu sắc trẻ trung',
    price: 100000,
    tax_rate: 0.05,
    category_name: 'Phụ kiện'
  },
  {
    id: 4,
    name: 'Áo khoác nam mùa đông',
    description: 'Chất liệu chống nước, giữ ấm tốt, phù hợp mùa đông và thời tiết lạnh',
    price: 500000,
    tax_rate: 0.10,
    category_name: 'Áo'
  }
];

const features = [
  {
    icon: '📊',
    title: 'Minh bạch VAT',
    description: 'Hiển thị rõ ràng giá chưa VAT và tổng tiền bao gồm VAT cho từng sản phẩm'
  },
  {
    icon: '🧮',
    title: 'Tự động tính thuế',
    description: 'Hệ thống tự động tính VAT theo từng danh mục sản phẩm, không cần tính tay'
  },
  {
    icon: '🧾',
    title: 'Hóa đơn chi tiết',
    description: 'Xuất hóa đơn đầy đủ với phân tích VAT từng mặt hàng, phù hợp cho doanh nghiệp'
  },
  {
    icon: '💼',
    title: 'Phù hợp doanh nghiệp',
    description: 'Hệ thống quản lý VAT chuyên nghiệp, đáp ứng yêu cầu kế toán và báo cáo'
  }
];

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section */}
        <motion.section
          className="grid md:grid-cols-2 gap-8 items-center py-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Left Side - Content */}
          <div className="space-y-6">
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Fashion Store
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Hệ thống thương mại điện tử thời trang với quản lý VAT tự động. 
              Mua sắm dễ dàng, minh bạch về thuế, phù hợp cho cả cá nhân và doanh nghiệp.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/products"
                className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Xem sản phẩm
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Banner Image */}
          <motion.div
            className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
              alt="Fashion Store Banner"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.section>

        {/* Feature Highlights Section */}
        <motion.section
          className="py-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Featured Products Section */}
        <motion.section
          className="py-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600">
              Khám phá những sản phẩm thời trang được yêu thích nhất
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </MainLayout>
  );
}

