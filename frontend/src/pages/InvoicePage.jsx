// Order invoice/receipt page
// Displays order details with itemized VAT breakdown

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, Button, Spin, Modal, Form, Input, Upload, message, Steps, Tag } from 'antd';
import { PrinterOutlined, HomeOutlined, UndoOutlined, PlusOutlined, OrderedListOutlined, DollarOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { ORDER_TRACKING_LABELS, RETURN_STATUS_CONFIG } from '../constants/orderCustomer';

const { TextArea } = Input;

/** Order progress timeline: PENDING → PAID → COMPLETED | CANCELLED */
function OrderProgressTimeline({ status }) {
  const s = (status || 'PENDING').toUpperCase();
  const current = s === 'PENDING' ? 0 : s === 'PAID' ? 1 : 2;
  const items = [
    { title: 'Đặt hàng', description: 'Đơn hàng đã được tạo', icon: <OrderedListOutlined /> },
    { title: 'Thanh toán', description: 'Đã thanh toán', icon: <DollarOutlined /> },
    {
      title: s === 'CANCELLED' ? 'Đã hủy' : 'Hoàn thành',
      description: s === 'CANCELLED' ? 'Đơn hàng đã hủy' : 'Giao hàng thành công',
      icon: s === 'CANCELLED' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      status: s === 'CANCELLED' ? 'error' : undefined,
    },
  ];
  return (
    <Steps
      current={current}
      items={items.map((item, i) => ({
        title: item.title,
        description: item.description,
        icon: item.icon,
        status: item.status ?? (i < current ? 'finish' : i === current ? 'process' : 'wait'),
      }))}
    />
  );
}

// Convert number to Vietnamese words (simplified version)
const convertNumberToWords = (num) => {
  // Simplified version - for full implementation, use a library
  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = Math.floor(num % 1000);
  
  let words = '';
  if (millions > 0) words += `${millions} triệu `;
  if (thousands > 0) words += `${thousands} nghìn `;
  if (remainder > 0) words += `${remainder} `;
  
  return words.trim() || 'không';
};

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [returnForm] = Form.useForm();
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/orders/${id}/invoice`);

      if (response.data.success) {
        const apiData = response.data.data;
        setInvoice({
          id: apiData.orderId,
          orderDate: apiData.orderDate,
          status: apiData.status || 'PENDING',
          returnStatus: apiData.returnStatus || 'NONE',
          completedAt: apiData.completedAt || null,
          customerInfo: {
            fullName: apiData.customer.name,
            email: apiData.customer.email,
            phone: apiData.customer.phone,
            address: apiData.customer.address,
            customerType: apiData.customer.type === 'BUSINESS' ? 'business' : 'individual',
            companyName: apiData.customer.companyName,
            taxCode: apiData.customer.taxCode,
            orderNotes: apiData.note
          },
          items: apiData.items,
          summary: apiData.summary,
          voucher: apiData.voucher
        });
      } else {
        setError(response.data.error || 'Không tìm thấy hóa đơn');
      }
    } catch (err) {
      console.error('Error fetching invoice:', err);
      if (err.response?.status === 403) {
        setError(ORDER_TRACKING_LABELS.forbidden);
      } else {
        setError(err.response?.data?.error || err.message || 'Không thể tải hóa đơn');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    } else {
      setError('Mã đơn hàng không hợp lệ');
      setLoading(false);
    }
  }, [id, fetchInvoice]);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // UC005: Nút hiện khi COMPLETED, NONE và trong vòng 7 ngày (ưu tiên completedAt, không có thì dùng orderDate)
  const isWithinReturnWindow = (completedAt, orderDate) => {
    const refDate = completedAt || orderDate;
    if (!refDate) return false;
    const ref = new Date(refDate);
    const deadline = new Date(ref);
    deadline.setDate(deadline.getDate() + 7);
    return new Date() <= deadline;
  };
  const showReturnButton =
    invoice?.status === 'COMPLETED' &&
    invoice?.returnStatus === 'NONE' &&
    isWithinReturnWindow(invoice?.completedAt, invoice?.orderDate);

  const handleOpenReturnModal = () => {
    returnForm.resetFields();
    setReturnModalVisible(true);
  };

  const handleCloseReturnModal = () => {
    setReturnModalVisible(false);
    returnForm.resetFields();
  };

  const handleSubmitReturnRequest = async () => {
    try {
      const values = await returnForm.validateFields(['reason']);
      const reason = values.reason?.trim?.() || '';
      const fileList = values.media?.fileList ?? values.media ?? [];

      const formData = new FormData();
      formData.append('reason', reason);
      fileList.forEach((item) => {
        if (item?.originFileObj) {
          formData.append('files', item.originFileObj);
        }
      });

      setSubmittingReturn(true);
      await api.post(`/orders/${id}/return-request`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        transformRequest: [(data, headers) => {
          delete headers['Content-Type'];
          return data;
        }]
      });

      message.success('Yêu cầu trả hàng đã được gửi thành công');
      handleCloseReturnModal();
      fetchInvoice();
    } catch (err) {
      if (err.errorFields) {
        return;
      }
      // Backend trả về { success: false, error: "..." } hoặc { success: false, message: "..." }
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Không thể gửi yêu cầu trả hàng';
      message.error(errorMsg);
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Table columns for invoice items
  const columns = [
    {
      title: 'STT',
      key: 'index',
      align: 'center',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {(record.size || record.color) && (
            <div className="text-sm text-gray-500">
              {record.size && `Kích thước: ${record.size}`}
              {record.size && record.color && ' • '}
              {record.color && `Màu: ${record.color}`}
            </div>
          )}
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
      title: 'Đơn giá (chưa VAT)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <span>{formatCurrency(price)}₫</span>
      ),
    },
    {
      title: 'Thuế suất VAT',
      dataIndex: 'vatRate',
      key: 'vatRate',
      align: 'center',
      width: 120,
      render: (vatRate) => (
        <span className="text-gray-600">
          {(vatRate * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      title: 'Tiền VAT',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      align: 'right',
      render: (vatAmount) => (
        <span className="text-gray-600">
          {formatCurrency(vatAmount)}₫
        </span>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(record.total)}₫
        </span>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="py-20">
          <div className="max-w-5xl mx-auto text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tải hóa đơn...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state (404, 403, or other)
  if (error || !invoice) {
    const isForbidden = error === ORDER_TRACKING_LABELS.forbidden;
    return (
      <MainLayout>
        <div className="py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">{error || 'Không tìm thấy hóa đơn'}</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {isForbidden && (
                  <Link to="/orders">
                    <Button type="primary" icon={<OrderedListOutlined />}>
                      {ORDER_TRACKING_LABELS.backToOrders}
                    </Button>
                  </Link>
                )}
                <Link to="/">
                  <Button icon={<HomeOutlined />}>Về trang chủ</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Extract data from invoice structure
  const { customerInfo, items, summary, orderDate, voucher } = invoice;

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Invoice Header - VAT Invoice Style */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 mb-6 border-2 border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Company Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                HÓA ĐƠN
              </h1>
            <p className="text-sm text-gray-500 mt-2">Fashion Store - Clothing E-commerce</p>
            </div>

            {/* Invoice Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mã hóa đơn:</p>
                <p className="text-lg font-bold text-gray-900">#{invoice.id}</p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-sm text-gray-600 mb-1">Ngày lập:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(orderDate)}
                </p>
              </div>
            </div>

            {/* Order progress timeline (UC003) */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Tiến trình đơn hàng</p>
              <OrderProgressTimeline status={invoice.status} />
            </div>

            {/* UC005 – Return request status badge */}
            {invoice.status === 'COMPLETED' && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Yêu cầu trả hàng</p>
                <Tag color={RETURN_STATUS_CONFIG[invoice.returnStatus]?.color ?? 'default'}>
                  {RETURN_STATUS_CONFIG[invoice.returnStatus]?.label ?? invoice.returnStatus}
                </Tag>
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Họ và tên: </span>
                  <span className="font-medium text-gray-900">{customerInfo.fullName}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email: </span>
                  <span className="font-medium text-gray-900">{customerInfo.email}</span>
                </div>
                {customerInfo.phone && (
                  <div>
                    <span className="text-sm text-gray-600">Số điện thoại: </span>
                    <span className="font-medium text-gray-900">{customerInfo.phone}</span>
                  </div>
                )}
                {customerInfo.address && (
                  <div>
                    <span className="text-sm text-gray-600">Địa chỉ giao hàng: </span>
                    <span className="font-medium text-gray-900">{customerInfo.address}</span>
                  </div>
                )}
                {customerInfo.customerType === 'business' && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Tên công ty: </span>
                      <span className="font-medium text-gray-900">{customerInfo.companyName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mã số thuế: </span>
                      <span className="font-medium text-gray-900">{customerInfo.taxCode}</span>
                    </div>
                  </>
                )}
                {customerInfo.orderNotes && (
                  <div className="pt-2 border-t border-gray-300 mt-2">
                    <span className="text-sm text-gray-600">Ghi chú đơn hàng: </span>
                    <p className="font-medium text-gray-900 mt-1">{customerInfo.orderNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Invoice Items Table */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Chi tiết sản phẩm
            </h2>
            <Table
              columns={columns}
              dataSource={items || []}
              pagination={false}
              rowKey={(record) => `${record.productId}-${record.price}-${record.quantity}`}
              className="invoice-table"
            />
          </motion.div>

          {/* VAT Summary - Invoice Style */}
          <motion.div
            className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tổng hợp thanh toán
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 text-base">
                <span className="text-gray-700">
                  Tạm tính (chưa VAT):
                </span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(summary.subtotal || summary.finalSubtotal + (summary.voucherDiscount || 0))}₫
                </span>
              </div>
              
              {/* Voucher Discount */}
              {voucher && voucher.discount > 0 && (
                <div className="flex justify-between items-center py-2 text-base">
                  <span className="text-green-700">
                    Giảm giá ({voucher.code}):
                  </span>
                  <span className="text-green-700 font-semibold">
                    -{formatCurrency(voucher.discount)}₫
                  </span>
                </div>
              )}
              
              {/* Final Subtotal after discount */}
              {voucher && voucher.discount > 0 && (
                <div className="flex justify-between items-center py-2 border-t border-gray-200 text-base">
                  <span className="text-gray-700">
                    Tạm tính sau giảm giá:
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(summary.finalSubtotal || summary.subtotal - voucher.discount)}₫
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-t border-gray-200 text-base">
                <span className="text-gray-700">
                  Tổng tiền thuế GTGT (VAT):
                </span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(summary.totalVAT)}₫
                </span>
              </div>
              
              {voucher && voucher.type === 'freeship' && (
                <div className="flex justify-between items-center py-2 text-base">
                  <span className="text-green-700">
                    Phí vận chuyển:
                  </span>
                  <span className="text-green-700 font-semibold">
                    Miễn phí
                  </span>
                </div>
              )}
              
              <div className="border-t-2 border-gray-400 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    TỔNG CỘNG THANH TOÁN:
                  </span>
                  <span className="text-3xl font-bold text-blue-600">
                    {formatCurrency(summary.total)}₫
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-right mt-1">
                  (Bằng chữ: {convertNumberToWords(summary.total)} đồng)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="mt-6 flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="h-11"
            >
              In hóa đơn
            </Button>
            {showReturnButton && (
              <Button
                type="primary"
                size="large"
                icon={<UndoOutlined />}
                onClick={handleOpenReturnModal}
                className="h-11 bg-orange-500 hover:bg-orange-600 border-orange-500"
              >
                Gửi yêu cầu trả hàng
              </Button>
            )}
            <Link to="/">
              <Button size="large" icon={<HomeOutlined />} className="h-11">
                Về trang chủ
              </Button>
            </Link>
          </motion.div>

          {/* Modal Yêu cầu trả hàng */}
          <Modal
            title="Yêu cầu trả hàng"
            open={returnModalVisible}
            onCancel={handleCloseReturnModal}
            onOk={handleSubmitReturnRequest}
            confirmLoading={submittingReturn}
            okText="Gửi yêu cầu"
            cancelText="Hủy"
            destroyOnClose
          >
            <Form
              form={returnForm}
              layout="vertical"
              preserve={false}
            >
              <Form.Item
                name="reason"
                label="Lý do trả hàng"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do trả hàng' },
                  { whitespace: true, message: 'Lý do không được để trống' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do trả hàng..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <Form.Item
                name="media"
                label="Ảnh hoặc video chứng minh (tùy chọn, tối đa 5)"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) return e;
                  return e?.fileList || [];
                }}
              >
                <Upload
                  listType="picture-card"
                  accept="image/*,video/*"
                  multiple
                  beforeUpload={() => false}
                  maxCount={5}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </motion.div>
    </MainLayout>
  );
}
