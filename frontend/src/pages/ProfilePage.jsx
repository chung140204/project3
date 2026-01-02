// User Profile Page
// Modern, clean, professional account management UI

import { useState, useEffect } from 'react';
import { Form, Input, Button, Avatar, message, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedFields, setChangedFields] = useState(new Set());

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/me');
      if (response.data.success) {
        const userData = response.data.user;
        setInitialValues({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });
        form.setFieldsValue({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Check if form values have changed and track which fields
  const handleFormChange = (changedValues, allValues) => {
    if (!initialValues) return;
    
    const changed = new Set();
    if (allValues.name !== initialValues.name) {
      changed.add('name');
    }
    if (allValues.phone !== initialValues.phone) {
      changed.add('phone');
    }
    
    setChangedFields(changed);
    setHasChanges(changed.size > 0);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const response = await api.put('/users/me', {
        name: values.name.trim(),
        phone: values.phone?.trim() || null
      });

      if (response.data.success) {
        // Update initial values to reflect saved state
        setInitialValues({
          name: values.name.trim(),
          email: initialValues.email, // Email doesn't change
          phone: values.phone?.trim() || null
        });
        setHasChanges(false);
        setChangedFields(new Set());
        message.success({
          content: 'Cập nhật thông tin thành công!',
          duration: 2,
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || 'Không thể cập nhật thông tin';
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-12 flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8 px-4 sm:px-6">
        <div className="max-w-[720px] mx-auto">
          {/* Main Card Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6">
              <div className="text-center">
                {/* Circular Avatar */}
                <div className="flex justify-center mb-4">
                  <Avatar 
                    size={80} 
                    icon={<UserOutlined />} 
                    className="bg-blue-600 shadow-md"
                    style={{ fontSize: '32px' }}
                  />
                </div>
                
                {/* Title */}
                <h1 className="text-[22px] font-bold text-gray-900 mb-2">
                  Thông tin cá nhân
                </h1>
                
                {/* Subtitle */}
                <p className="text-sm text-gray-600">
                  Quản lý thông tin tài khoản của bạn
                </p>
              </div>
              
              {/* Divider */}
              <div className="mt-6 border-t border-gray-200"></div>
            </div>

            {/* Form Section */}
            <div className="px-8 pb-8">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleFormChange}
                className="space-y-6"
              >
                {/* Full Name Field */}
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Họ và tên
                    </span>
                  }
                  name="name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' },
                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' }
                  ]}
                  className="mb-0"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nhập họ và tên"
                    size="large"
                    className={`h-11 rounded-lg transition-all ${
                      changedFields.has('name') 
                        ? 'border-blue-400 shadow-sm' 
                        : ''
                    }`}
                  />
                </Form.Item>

                {/* Email Field (Readonly) */}
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Email
                    </span>
                  }
                  name="email"
                  className="mb-0"
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    disabled
                    size="large"
                    className="h-11 rounded-lg bg-gray-50 cursor-not-allowed"
                    suffix={
                      <span className="text-xs text-gray-500 font-normal">
                        Email không thể thay đổi
                      </span>
                    }
                  />
                </Form.Item>

                {/* Phone Number Field */}
                <Form.Item
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Số điện thoại
                    </span>
                  }
                  name="phone"
                  rules={[
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ (10-11 chữ số)'
                    }
                  ]}
                  className="mb-0"
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="Nhập số điện thoại (tùy chọn)"
                    size="large"
                    className={`h-11 rounded-lg transition-all ${
                      changedFields.has('phone') 
                        ? 'border-blue-400 shadow-sm' 
                        : ''
                    }`}
                  />
                </Form.Item>

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  {/* Primary Save Button */}
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    disabled={!hasChanges || saving}
                    loading={saving}
                    block
                    className="h-11 rounded-lg font-medium text-base bg-blue-600 hover:bg-blue-700 border-none shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>

                  {/* Secondary Change Password Button (Optional) */}
                  <Button
                    type="text"
                    size="large"
                    icon={<LockOutlined />}
                    block
                    className="h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                    onClick={() => {
                      message.info('Tính năng đổi mật khẩu đang được phát triển');
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

