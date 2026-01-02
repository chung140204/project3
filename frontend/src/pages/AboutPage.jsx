// About page
// Company information and introduction

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  PercentageOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  StarOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Giới thiệu về Fashion Store
            </h1>
            <p className="text-xl text-gray-600">
              Hệ thống thương mại điện tử thời trang với quản lý VAT chuyên nghiệp
            </p>
          </div>

          {/* Hero Image */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=675&fit=crop"
                alt="Modern fashion e-commerce platform"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingOutlined className="text-2xl text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-xs text-gray-500">Đơn hàng</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Tổng số đơn hàng đã xử lý</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarOutlined className="text-2xl text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-500">Minh bạch</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">VAT transparency trong mọi giao dịch</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PercentageOutlined className="text-2xl text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-xs text-gray-500">Mức VAT</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Hỗ trợ nhiều mức thuế suất VAT</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserOutlined className="text-2xl text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">2</div>
                  <div className="text-xs text-gray-500">Loại KH</div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Cá nhân và Doanh nghiệp</p>
            </div>
          </div>

          {/* About Content */}
          <div className="space-y-8">
            {/* Mission Section */}
            <motion.section
              className="bg-white rounded-lg shadow-md p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Fashion Store được thành lập với mục tiêu mang đến trải nghiệm mua sắm thời trang 
                trực tuyến tốt nhất, đồng thời đảm bảo tính minh bạch và chuyên nghiệp trong quản lý 
                thuế giá trị gia tăng (VAT).
              </p>
              <p className="text-gray-700 leading-relaxed">
                Chúng tôi tin rằng mỗi khách hàng, dù là cá nhân hay doanh nghiệp, đều xứng đáng có 
                được thông tin rõ ràng về giá cả và thuế để đưa ra quyết định mua sắm sáng suốt.
              </p>
            </motion.section>

            {/* Features Section */}
            <motion.section
              className="bg-white rounded-lg shadow-md p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Điểm nổi bật
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircleOutlined className="text-blue-600 text-lg" />
                    Minh bạch về giá
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Hiển thị rõ ràng giá chưa VAT và tổng tiền bao gồm VAT cho từng sản phẩm
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CalculatorOutlined className="text-blue-600 text-lg" />
                    Tự động tính VAT
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Hệ thống tự động tính VAT theo từng danh mục sản phẩm, không cần tính tay
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileTextOutlined className="text-blue-600 text-lg" />
                    Hóa đơn chi tiết
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Xuất hóa đơn đầy đủ với phân tích VAT từng mặt hàng, phù hợp cho doanh nghiệp
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <StarOutlined className="text-blue-600 text-lg" />
                    Sản phẩm chất lượng
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Chọn lọc những sản phẩm thời trang chất lượng cao từ các thương hiệu uy tín
                  </p>
                </div>
              </div>
            </motion.section>

            {/* VAT Process Timeline */}
            <motion.section
              className="bg-white rounded-lg shadow-md p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quy trình tính và hiển thị VAT
              </h2>
              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Timeline Content */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Xác định giá gốc</h3>
                      <p className="text-gray-600 text-sm">
                        Hệ thống lấy giá sản phẩm chưa bao gồm VAT từ cơ sở dữ liệu
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Áp dụng mức VAT</h3>
                      <p className="text-gray-600 text-sm">
                        Hệ thống tự động lấy mức thuế suất VAT từ danh mục sản phẩm (5%, 10%)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Tính toán VAT</h3>
                      <p className="text-gray-600 text-sm">
                        VAT = Giá gốc × Thuế suất. Tổng tiền = Giá gốc + VAT
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Hiển thị minh bạch</h3>
                      <p className="text-gray-600 text-sm">
                        Hiển thị rõ ràng giá chưa VAT, VAT, và tổng tiền trên mọi trang sản phẩm và hóa đơn
                      </p>
                    </div>
                  </div>
                </div>

                {/* VAT Invoice Image */}
                <motion.div
                  className="order-first md:order-last"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop"
                      alt="VAT invoice and calculation breakdown"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Customer Types Section */}
            <motion.section
              className="bg-white rounded-lg shadow-md p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Phục vụ mọi loại khách hàng
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Individual Customer Card */}
                <motion.div
                  className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop"
                      alt="Individual customer online shopping"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserOutlined className="text-blue-600" />
                      Khách hàng cá nhân
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Hiểu rõ giá cả trước khi mua</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Mua sắm tiện lợi, minh bạch</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Hóa đơn đơn giản, dễ hiểu</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Business Customer Card */}
                <motion.div
                  className="border border-gray-200 rounded-lg overflow-hidden bg-blue-50"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop"
                      alt="Business customer accounting and invoice"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingOutlined className="text-blue-600" />
                      Khách hàng doanh nghiệp
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Hóa đơn VAT đầy đủ, chi tiết</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Phù hợp cho kế toán và báo cáo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleOutlined className="text-green-600 mt-0.5" />
                        <span>Tuân thủ quy định thuế</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* VAT Management Section */}
            <motion.section
              className="bg-blue-50 rounded-lg p-8 border-2 border-blue-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quản lý VAT chuyên nghiệp
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Fashion Store được phát triển với hệ thống quản lý VAT tự động và minh bạch, 
                đáp ứng đầy đủ yêu cầu của:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Kế toán doanh nghiệp cần hóa đơn VAT chi tiết</li>
                <li>Khách hàng cá nhân muốn hiểu rõ về giá cả</li>
                <li>Quy định về thuế và báo cáo tài chính</li>
                <li>Yêu cầu minh bạch trong giao dịch thương mại điện tử</li>
              </ul>
            </motion.section>

            {/* Contact CTA */}
            <motion.div
              className="text-center bg-gray-100 rounded-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Có câu hỏi? Liên hệ với chúng tôi
              </h3>
              <Link
                to="/contact"
                className="inline-block bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
              >
                Liên hệ ngay
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

