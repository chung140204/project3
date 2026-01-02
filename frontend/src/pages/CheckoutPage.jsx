// Order checkout page
// Order summary, customer information, and order placement

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button, Table, message, Radio, Collapse, Checkbox, Spin, Select, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TagOutlined, EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { calculateCartTotals } from '../context/CartContext';
import api from '../services/api';

const { Panel } = Collapse;
const { Option } = Select;

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerType, setCustomerType] = useState('individual');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Address management state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  // Fetch saved addresses on mount
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  // Auto-fill default address when addresses are loaded
  useEffect(() => {
    if (savedAddresses.length > 0 && useSavedAddress) {
      const defaultAddress = savedAddresses.find(addr => addr.is_default) || savedAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        form.setFieldsValue({
          fullName: defaultAddress.recipient_name,
          phone: defaultAddress.phone,
          address: defaultAddress.address
        });
      }
    }
  }, [savedAddresses, useSavedAddress]);

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      if (response.data.success) {
        setSavedAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Handle address selection change
  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      form.setFieldsValue({
        fullName: selectedAddress.recipient_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address
      });
    }
  };

  // Calculate base order summary from cart items
  const baseSummary = calculateCartTotals(cartItems);

  // Voucher logic
  const validVouchers = {
    'SALE10': { type: 'discount', value: 0.10, description: 'Giảm 10% trên tổng tiền (chưa VAT)' },
    'FREESHIP': { type: 'freeship', value: 0, description: 'Miễn phí vận chuyển' }
  };

  // Calculate voucher discount
  const calculateVoucherDiscount = () => {
    if (!appliedVoucher) return 0;
    
    const voucher = validVouchers[appliedVoucher];
    if (voucher.type === 'discount') {
      return baseSummary.subtotal * voucher.value;
    }
    return 0; // FREESHIP is UI only
  };

  const voucherDiscount = calculateVoucherDiscount();
  const shippingFee = appliedVoucher === 'FREESHIP' ? 0 : 0; // Free shipping for demo
  const finalSubtotal = baseSummary.subtotal - voucherDiscount;
  const finalTotal = finalSubtotal + baseSummary.totalVAT + shippingFee;

  // Handle voucher apply
  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    
    if (!code) {
      setVoucherError('Vui lòng nhập mã voucher');
      return;
    }

    if (validVouchers[code]) {
      setAppliedVoucher(code);
      setVoucherError('');
      message.success(`Áp dụng voucher "${code}" thành công!`);
    } else {
      setAppliedVoucher(null);
      setVoucherError('Mã voucher không hợp lệ');
      message.error('Mã voucher không hợp lệ');
    }
  };

  // Handle voucher remove
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
    message.info('Đã xóa voucher');
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Calculate item totals dynamically
  const getItemTotals = (item) => {
    const subtotal = item.price * item.quantity;
    const vatAmount = subtotal * item.vatRate;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  // Table columns for order items
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            {record.size || 'N/A'} • {record.color || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100,
    },
    {
      title: 'Giá (chưa VAT)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <span>{formatCurrency(price)}₫</span>
      ),
    },
    {
      title: 'VAT',
      key: 'vat',
      align: 'right',
      render: (_, record) => {
        const itemTotals = getItemTotals(record);
        return (
          <span className="text-gray-600">
            {(record.vatRate * 100).toFixed(0)}% • {formatCurrency(itemTotals.vatAmount)}₫
          </span>
        );
      },
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => {
        const itemTotals = getItemTotals(record);
        return (
          <span className="font-semibold">
            {formatCurrency(itemTotals.total)}₫
          </span>
        );
      },
    },
  ];

  const onFinish = async (values) => {
    if (cartItems.length === 0) {
      message.error('Giỏ hàng trống');
      return;
    }

    try {
      setLoading(true);

      // Prepare request payload for backend
      // Note: Do NOT send VAT calculations from frontend - backend will calculate everything
      const payload = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null
        })),
        customer: {
          name: values.fullName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          type: values.customerType === 'business' ? 'BUSINESS' : 'INDIVIDUAL',
          companyName: values.companyName || null,
          taxCode: values.taxCode || null,
          note: values.orderNotes || null
        },
        voucherCode: appliedVoucher || null
      };

      // Save new address if requested
      if (saveNewAddress && !useSavedAddress) {
        try {
          await api.post('/users/addresses', {
            recipient_name: values.fullName.trim(),
            phone: values.phone.trim(),
            address: values.address.trim(),
            is_default: savedAddresses.length === 0 // Set as default if no addresses exist
          });
          message.success('Đã lưu địa chỉ mới');
        } catch (error) {
          console.error('Error saving address:', error);
          // Continue with checkout even if address save fails
        }
      }

      // Call backend API to create order
      // Backend will:
      // - Fetch product prices and VAT rates from database
      // - Calculate all VAT amounts
      // - Apply voucher discount
      // - Store order in database
      const response = await api.post('/orders/checkout', payload);

      if (response.data.success) {
        const orderId = response.data.data.orderId;

        // Show success notification
        message.success({
          content: '🎉 Đặt hàng thành công!',
          duration: 1.5,
        });
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to invoice page after delay
        setTimeout(() => {
          navigate(`/orders/${orderId}/invoice`);
        }, 1500);
      } else {
        throw new Error(response.data.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <motion.div
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-6">
              Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán
            </p>
            <Link to="/products">
              <Button type="primary" size="large">
                Xem sản phẩm
              </Button>
            </Link>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Thanh toán
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Information Form */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Thông tin khách hàng
                  </h2>
                  
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    initialValues={{ customerType: 'individual' }}
                  >
                    {/* Address Selection */}
                    {savedAddresses.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700">
                            Chọn địa chỉ đã lưu
                          </label>
                          <Link to="/addresses" className="text-blue-600 hover:text-blue-700 text-sm">
                            <PlusOutlined /> Quản lý địa chỉ
                          </Link>
                        </div>
                        <Radio.Group
                          value={useSavedAddress ? 'saved' : 'new'}
                          onChange={(e) => {
                            const useSaved = e.target.value === 'saved';
                            setUseSavedAddress(useSaved);
                            if (useSaved && savedAddresses.length > 0) {
                              const defaultAddress = savedAddresses.find(addr => addr.is_default) || savedAddresses[0];
                              if (defaultAddress) {
                                handleAddressChange(defaultAddress.id);
                              }
                            } else {
                              form.setFieldsValue({
                                fullName: '',
                                phone: '',
                                address: ''
                              });
                            }
                          }}
                          className="w-full"
                        >
                          <div className="space-y-2">
                            <Radio value="saved" className="w-full">
                              <div className="flex items-center justify-between w-full">
                                <span>Sử dụng địa chỉ đã lưu</span>
                              </div>
                            </Radio>
                            {useSavedAddress && (
                              <Select
                                value={selectedAddressId}
                                onChange={handleAddressChange}
                                placeholder="Chọn địa chỉ"
                                size="large"
                                className="w-full mt-2"
                              >
                                {savedAddresses.map((addr) => (
                                  <Option key={addr.id} value={addr.id}>
                                    <div className="flex items-center justify-between">
                                      <span>{addr.recipient_name} - {addr.phone}</span>
                                      {addr.is_default && (
                                        <Tag color="blue" size="small" className="ml-2">
                                          Mặc định
                                        </Tag>
                                      )}
                                    </div>
                                  </Option>
                                ))}
                              </Select>
                            )}
                            <Radio value="new" className="w-full">
                              Nhập địa chỉ mới
                            </Radio>
                          </div>
                        </Radio.Group>
                        {useSavedAddress && (
                          <Checkbox
                            checked={saveNewAddress}
                            onChange={(e) => setSaveNewAddress(e.target.checked)}
                            className="mt-2"
                          >
                            Lưu địa chỉ này cho lần sau
                          </Checkbox>
                        )}
                      </div>
                    )}

                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        { required: true, message: 'Vui lòng nhập họ và tên' }
                      ]}
                    >
                      <Input 
                        size="large" 
                        placeholder="Nguyễn Văn A"
                        disabled={useSavedAddress && selectedAddressId}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                      ]}
                    >
                      <Input size="large" placeholder="example@email.com" />
                    </Form.Item>

                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 số)' }
                      ]}
                    >
                      <Input 
                        size="large" 
                        placeholder="0901234567"
                        disabled={useSavedAddress && selectedAddressId}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Địa chỉ giao hàng"
                      name="address"
                      rules={[
                        { required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }
                      ]}
                    >
                      <Input.TextArea
                        rows={4}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        size="large"
                        disabled={useSavedAddress && selectedAddressId}
                      />
                    </Form.Item>

                    {/* Save new address checkbox (only show when entering new address) */}
                    {!useSavedAddress && savedAddresses.length > 0 && (
                      <Form.Item>
                        <Checkbox
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        >
                          Lưu địa chỉ này cho lần sau
                        </Checkbox>
                      </Form.Item>
                    )}

                    <Form.Item
                      label="Loại khách hàng"
                      name="customerType"
                      rules={[
                        { required: true, message: 'Vui lòng chọn loại khách hàng' }
                      ]}
                    >
                      <Radio.Group 
                        onChange={(e) => setCustomerType(e.target.value)}
                        value={customerType}
                      >
                        <Radio value="individual">Cá nhân</Radio>
                        <Radio value="business">Doanh nghiệp</Radio>
                      </Radio.Group>
                    </Form.Item>

                    {/* Business-specific fields */}
                    {customerType === 'business' && (
                      <>
                        <Form.Item
                          label="Tên công ty"
                          name="companyName"
                          rules={[
                            { required: true, message: 'Vui lòng nhập tên công ty' }
                          ]}
                        >
                          <Input size="large" placeholder="Công ty TNHH ABC" />
                        </Form.Item>

                        <Form.Item
                          label="Mã số thuế"
                          name="taxCode"
                          rules={[
                            { required: true, message: 'Vui lòng nhập mã số thuế' },
                            { pattern: /^[0-9]{10,13}$/, message: 'Mã số thuế không hợp lệ (10-13 số)' }
                          ]}
                        >
                          <Input size="large" placeholder="0123456789" />
                        </Form.Item>
                      </>
                    )}

                    {/* Order Notes (Optional) */}
                    <Form.Item
                      label="Ghi chú đơn hàng"
                      name="orderNotes"
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
                        size="large"
                      />
                    </Form.Item>
                  </Form>
                </div>
              </motion.div>

              {/* Order Items Table */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Đơn hàng
                  </h2>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Giỏ hàng trống
                    </div>
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={cartItems}
                      pagination={false}
                      rowKey="id"
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-lg shadow-md p-6 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Tóm tắt đơn hàng
                </h2>

                {/* Voucher Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <Collapse ghost>
                    <Panel 
                      header={
                        <div className="flex items-center gap-2">
                          <TagOutlined className="text-blue-600" />
                          <span className="font-medium">Mã giảm giá / Voucher</span>
                        </div>
                      }
                      key="voucher"
                    >
                      <div className="space-y-3">
                        {appliedVoucher ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CheckCircleOutlined className="text-green-600" />
                                <span className="font-medium text-green-800">
                                  {appliedVoucher}
                                </span>
                              </div>
                              <Button
                                type="link"
                                size="small"
                                danger
                                onClick={handleRemoveVoucher}
                              >
                                Xóa
                              </Button>
                            </div>
                            <p className="text-sm text-green-700">
                              {validVouchers[appliedVoucher].description}
                            </p>
                            {appliedVoucher === 'SALE10' && (
                              <p className="text-sm font-semibold text-green-800 mt-1">
                                Giảm: {formatCurrency(voucherDiscount)}₫
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Nhập mã voucher"
                              value={voucherCode}
                              onChange={(e) => {
                                setVoucherCode(e.target.value);
                                setVoucherError('');
                              }}
                              onPressEnter={handleApplyVoucher}
                              status={voucherError ? 'error' : ''}
                            />
                            <Button
                              type="primary"
                              onClick={handleApplyVoucher}
                            >
                              Áp dụng
                            </Button>
                          </div>
                        )}
                        {voucherError && (
                          <div className="text-sm text-red-600 flex items-center gap-1">
                            <CloseCircleOutlined />
                            <span>{voucherError}</span>
                          </div>
                        )}
                        {!appliedVoucher && (
                          <p className="text-xs text-gray-500">
                            Mã demo: <span className="font-medium">SALE10</span> (giảm 10%),{' '}
                            <span className="font-medium">FREESHIP</span> (miễn phí ship)
                          </p>
                        )}
                      </div>
                    </Panel>
                  </Collapse>
                </div>

                {/* VAT Summary Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tạm tính (chưa VAT):</span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(baseSummary.subtotal)}₫
                    </span>
                  </div>

                  {/* Voucher Discount */}
                  {appliedVoucher && voucherDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600">Giảm giá ({appliedVoucher}):</span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(voucherDiscount)}₫
                      </span>
                    </div>
                  )}

                  {/* Final Subtotal after discount */}
                  {appliedVoucher && voucherDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                      <span className="text-gray-600">Tạm tính sau giảm giá:</span>
                      <span className="text-gray-800 font-medium">
                        {formatCurrency(finalSubtotal)}₫
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-3">
                    <span className="text-gray-600">Tổng VAT:</span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(baseSummary.totalVAT)}₫
                    </span>
                  </div>

                  {appliedVoucher === 'FREESHIP' && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600">Phí vận chuyển:</span>
                      <span className="text-green-600 font-medium">
                        Miễn phí
                      </span>
                    </div>
                  )}

                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng cộng:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(finalTotal)}₫
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      (đã bao gồm VAT{appliedVoucher ? ' và giảm giá' : ''})
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mb-4">
                  <Form.Item
                    name="agreeToTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản mua hàng'))
                      }
                    ]}
                  >
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                    >
                      Tôi đồng ý với{' '}
                      <Link to="/terms" className="text-blue-600 hover:underline">
                        điều khoản mua hàng
                      </Link>
                    </Checkbox>
                  </Form.Item>
                </div>

                {/* Place Order Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  className={`h-12 text-base font-semibold ${
                    !agreeToTerms ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => form.submit()}
                  loading={loading}
                  disabled={cartItems.length === 0 || loading || !agreeToTerms}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
                {!agreeToTerms && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Vui lòng đồng ý với điều khoản mua hàng để tiếp tục
                  </p>
                )}

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Miễn phí vận chuyển</p>
                    <p>✓ Đổi trả trong 7 ngày</p>
                    <p>✓ Thanh toán an toàn</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
