// Shipping Addresses Management Page
// Modern e-commerce style (Shopee/Lazada inspired)

import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Tag, 
  Empty,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  StarOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();

  // Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/addresses');
      if (response.data.success) {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Open modal for editing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    form.setFieldsValue({
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      is_default: address.is_default
    });
    setModalVisible(true);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (values) => {
    try {
      if (editingAddress) {
        // Update existing address
        const response = await api.put(`/users/addresses/${editingAddress.id}`, {
          recipient_name: values.recipient_name.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          is_default: values.is_default || false
        });

        if (response.data.success) {
          message.success({
            content: 'Cập nhật địa chỉ thành công!',
            duration: 2,
          });
          setModalVisible(false);
          fetchAddresses();
        }
      } else {
        // Create new address
        const response = await api.post('/users/addresses', {
          recipient_name: values.recipient_name.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          is_default: values.is_default || false
        });

        if (response.data.success) {
          message.success({
            content: 'Thêm địa chỉ thành công!',
            duration: 2,
          });
          setModalVisible(false);
          fetchAddresses();
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = error.response?.data?.error || 'Không thể lưu địa chỉ';
      message.error(errorMessage);
    }
  };

  // Set address as default
  const handleSetDefault = async (addressId) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}/set-default`);
      if (response.data.success) {
        message.success({
          content: 'Đã đặt làm địa chỉ mặc định',
          duration: 2,
        });
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      message.error('Không thể đặt địa chỉ mặc định');
    }
  };

  // Delete address
  const handleDelete = async (addressId) => {
    try {
      const response = await api.delete(`/users/addresses/${addressId}`);
      if (response.data.success) {
        message.success('Đã xóa địa chỉ');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      const errorMessage = error.response?.data?.error || 'Không thể xóa địa chỉ';
      message.error(errorMessage);
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
        <div className="max-w-[900px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Địa chỉ giao hàng
              </h1>
              <p className="text-gray-600 text-sm">
                Quản lý địa chỉ nhận hàng của bạn
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAddAddress}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 border-none shadow-sm hover:shadow-md transition-all"
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Address List */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <Empty
                description={
                  <span className="text-gray-600 text-base">
                    Bạn chưa có địa chỉ giao hàng
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  onClick={handleAddAddress}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
                >
                  Thêm địa chỉ đầu tiên
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
                    address.is_default
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Left: Address Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name and Default Badge */}
                        <div className="flex items-center gap-3 mb-3">
                          {address.is_default && (
                            <Tag 
                              color="#2563eb" 
                              icon={<StarOutlined />}
                              className="m-0 border-0 px-3 py-1 text-xs font-medium"
                              style={{ 
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                borderRadius: '6px'
                              }}
                            >
                              Mặc định
                            </Tag>
                          )}
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {address.recipient_name}
                          </h3>
                        </div>
                        
                        {/* Phone and Address */}
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-gray-400 text-xs" />
                            <span>{address.phone}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <EnvironmentOutlined className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                            <span className="break-words leading-relaxed">{address.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex flex-col gap-2 sm:ml-4 sm:min-w-[140px]">
                        {!address.is_default && (
                          <Button
                            size="middle"
                            icon={<StarOutlined />}
                            onClick={() => handleSetDefault(address.id)}
                            className="h-9 text-sm border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                          >
                            Đặt làm mặc định
                          </Button>
                        )}
                        <Button
                          size="middle"
                          icon={<EditOutlined />}
                          onClick={() => handleEditAddress(address)}
                          className="h-9 text-sm border-gray-300 text-gray-700 hover:border-gray-400"
                        >
                          Sửa
                        </Button>
                        <Popconfirm
                          title="Xóa địa chỉ"
                          description="Bạn có chắc muốn xóa địa chỉ này?"
                          onConfirm={() => handleDelete(address.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ 
                            danger: true,
                            className: 'bg-red-600 hover:bg-red-700'
                          }}
                        >
                          <Button
                            size="middle"
                            danger
                            icon={<DeleteOutlined />}
                            className="h-9 text-sm border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50"
                          >
                            Xóa
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Address Modal */}
          <Modal
            title={
              <span className="text-lg font-semibold text-gray-900">
                {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
              </span>
            }
            open={modalVisible}
            onCancel={() => {
              setModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            width={600}
            className="address-modal"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ is_default: false }}
              className="mt-4"
            >
              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Tên người nhận</span>}
                name="recipient_name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên người nhận' },
                  { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }
                ]}
                className="mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nguyễn Văn A"
                  size="large"
                  className="h-11 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Số điện thoại</span>}
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại' },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ (10-11 chữ số)'
                  }
                ]}
                className="mb-4"
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="0123456789"
                  size="large"
                  className="h-11 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-medium text-gray-700">Địa chỉ</span>}
                name="address"
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ' },
                  { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự' }
                ]}
                className="mb-4"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  size="large"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="is_default"
                valuePropName="checked"
                className="mb-0"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.getFieldValue('is_default')}
                    onChange={(e) => form.setFieldsValue({ is_default: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-gray-700 cursor-pointer">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                    }}
                    size="large"
                    className="h-11 px-6"
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
}
