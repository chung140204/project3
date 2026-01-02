import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Save token and user
        setAuth(token, user);

        message.success('Đăng nhập thành công!');

        // Redirect based on role
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout showNavbar={false}>
      <div className="min-h-screen flex">
        {/* Left Column - Brand Section (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80)'
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          {/* Centered Brand Content */}
          <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">
              FASHION STORE
            </h1>
            <p className="text-xl text-gray-200 max-w-md">
              Thời trang minh bạch – Quản lý VAT chuyên nghiệp
            </p>
            <div className="mt-8 w-24 h-1 bg-white"></div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Đăng nhập
                </h2>
                <p className="text-gray-600 text-sm">
                  Chào mừng bạn quay lại Fashion Store
                </p>
              </div>

              {/* Login Form */}
              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                size="large"
                className="space-y-4"
              >
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="your@email.com"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-gray-700 font-medium">Mật khẩu</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập mật khẩu"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                {/* Optional: Forgot Password */}
                <div className="flex justify-end mb-4">
                  <Link
                    to="#"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      message.info('Tính năng quên mật khẩu sẽ được thêm vào sau');
                    }}
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Form.Item className="mb-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 border-none shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Register Link */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Chưa có tài khoản?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Link to="#" className="text-blue-600 hover:underline">
                Điều khoản sử dụng
              </Link>
              {' '}và{' '}
              <Link to="#" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

