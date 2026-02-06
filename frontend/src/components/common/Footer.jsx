// Site footer component
// Footer links, copyright notice, and social media links

import { Link } from 'react-router-dom';
import { FacebookOutlined, InstagramOutlined } from '@ant-design/icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-3">
              Fashion Store
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Nền tảng thương mại điện tử thời trang với quản lý VAT minh bạch.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              © 2026 - Dự án tốt nghiệp
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Support & Policies */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">
              Hỗ trợ & Chính sách
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Chính sách VAT & hóa đơn
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  onClick={(e) => e.preventDefault()}
                >
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">
              Liên hệ
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gray-500">📧</span>
                <span>chungtien6b@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500">📞</span>
                <span>Hotline: 1900 1234</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500">📍</span>
                <span>
                  Nhà số 3, Phố Phan Đình Giót, Phường Phương Liệt<br />
                  Thành phố Hà Nội<br />
                  Việt Nam
                </span>
              </li>
            </ul>

            {/* Social Media Icons */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                onClick={(e) => e.preventDefault()}
                aria-label="Facebook"
              >
                <FacebookOutlined className="text-lg text-gray-300" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-200"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
              >
                <InstagramOutlined className="text-lg text-gray-300" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            © 2026 Fashion Store – Clothing E-commerce with VAT Management
          </p>
        </div>
      </div>
    </footer>
  );
}
