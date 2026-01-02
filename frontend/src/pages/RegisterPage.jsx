import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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

      const response = await api.post('/auth/register', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirm_password
      });

      if (response.data.success) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.';
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
              backgroundImage: 'url(https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80)'
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
              Tạo tài khoản để mua sắm minh bạch & tiện lợi
            </p>
            <div className="mt-8 w-24 h-1 bg-white"></div>
          </div>
        </div>

        {/* Right Column - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 bg-gray-50 py-8">
          <div className="w-full max-w-md">
            {/* Register Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Đăng ký tài khoản
                </h2>
                <p className="text-gray-600 text-sm">
                  Tham gia Fashion Store ngay hôm nay
                </p>
              </div>

              {/* Register Form */}
              <Form
                name="register"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                size="large"
                className="space-y-4"
              >
                <Form.Item
                  label={<span className="text-gray-700 font-medium">Họ và tên</span>}
                  name="name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nguyễn Văn A"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

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
                  label={<span className="text-gray-700 font-medium">Số điện thoại</span>}
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="0901234567"
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
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-gray-700 font-medium">Xác nhận mật khẩu</span>}
                  name="confirm_password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Nhập lại mật khẩu"
                    className="h-12 rounded-lg"
                  />
                </Form.Item>

                <Form.Item className="mb-4 mt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="h-12 text-base font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 border-none shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </Button>
                </Form.Item>
              </Form>

              {/* Login Link */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/"
                    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Bằng việc đăng ký, bạn đồng ý với{' '}
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

