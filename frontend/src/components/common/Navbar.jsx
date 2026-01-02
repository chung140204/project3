// Main navigation bar component
// Professional 3-section layout with user dropdown menu

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  SearchOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Avatar } from 'antd';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout, setAuth, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Fetch user data from API to ensure it's up-to-date (especially name field)
  useEffect(() => {
    const fetchUserData = async () => {
      // Only fetch if user is authenticated, token exists, and user doesn't have name
      if (token && user && !user.name) {
        try {
          const response = await api.get('/users/me');
          if (response.data.success && response.data.user) {
            const updatedUser = response.data.user;
            
            // Update auth context with fresh user data (especially if name was missing)
            if (updatedUser.name) {
              setAuth(token, updatedUser);
            }
          }
        } catch (error) {
          // Silently fail - don't disrupt user experience
          // User data might be stale but still functional
          console.error('Failed to fetch updated user data:', error);
        }
      }
    };

    fetchUserData();
  }, [token, user, setAuth]); // Run when token or user changes (but only if user doesn't have name)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/', { replace: true });
  };

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LEFT: Brand Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/home" 
              className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
            >
              FASHION STORE
            </Link>
          </div>

          {/* CENTER: Main Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 md:flex-1 md:justify-center">
            <Link 
              to="/products" 
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/products')
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-400'
              }`}
            >
              Sản phẩm
            </Link>
            <Link 
              to="/about" 
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-400'
              }`}
            >
              Giới thiệu
            </Link>
            <Link 
              to="/contact" 
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/contact')
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-400'
              }`}
            >
              Liên hệ
            </Link>
          </div>

          {/* RIGHT: Search, User Menu, Cart */}
          <div className="flex items-center space-x-4">
            {/* Search Icon (Optional) */}
            <button
              className="hidden lg:block text-white hover:text-gray-300 transition-colors"
              title="Tìm kiếm"
              onClick={() => {
                // Placeholder for future search functionality
                console.log('Search clicked');
              }}
            >
              <SearchOutlined className="text-lg" />
            </button>

            {/* User Menu Dropdown */}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors px-3 py-2 rounded-md hover:bg-gray-800"
                >
                  <UserOutlined className="text-lg" />
                  <span className="hidden md:inline text-sm font-medium">
                    {user.name}
                  </span>
                  <DownOutlined className={`text-xs transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-4 border-b border-gray-200">
                      <div className="flex items-start gap-3">
                        {/* Avatar Icon */}
                        <Avatar 
                          size={40} 
                          icon={<UserOutlined />} 
                          className="bg-blue-600 flex-shrink-0"
                        />
                        
                        {/* Name and Email */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-gray-900 mb-0.5 truncate">
                            {user.name || user.email}
                          </p>
                          {user.name && (
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          )}
                          {user.role === 'ADMIN' && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ProfileOutlined className="mr-3 text-gray-400" />
                        Thông tin cá nhân
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingOutlined className="mr-3 text-gray-400" />
                        Lịch sử mua hàng
                      </Link>
                      <Link
                        to="/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <EnvironmentOutlined className="mr-3 text-gray-400" />
                        Địa chỉ giao hàng
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                        >
                          <UserOutlined className="mr-3 text-blue-500" />
                          Trang quản trị
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogoutOutlined className="mr-3" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Icon with Badge */}
            <Link 
              to="/cart" 
              className="relative text-white hover:text-gray-300 transition-colors p-2 rounded-md hover:bg-gray-800"
              title="Giỏ hàng"
            >
              <ShoppingCartOutlined className="text-xl" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white hover:text-gray-300 transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black">
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link 
              to="/products" 
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive('/products')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive('/about')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Giới thiệu
            </Link>
            <Link 
              to="/contact" 
              className={`block px-3 py-2 rounded-md transition-colors ${
                isActive('/contact')
                  ? 'text-white bg-gray-800'
                  : 'text-gray-300 hover:text-white hover:bg-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>

            {/* User Menu in Mobile */}
            {user && (
              <>
                <div className="border-t border-gray-800 my-2"></div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-900 rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Lịch sử mua hàng
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-gray-900 rounded-md transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Trang quản trị
                  </Link>
                )}
                <div className="border-t border-gray-800 my-2"></div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 rounded-md transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
