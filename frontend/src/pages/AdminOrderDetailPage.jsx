// Admin Order Detail Page
// Read-only invoice view for admin to view customer orders with full VAT breakdown

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, Button, Spin, Card, Tag, Divider } from 'antd';
import { 
  PrinterOutlined, 
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

// Format currency helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount || 0));
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format order ID
const formatOrderId = (id) => {
  return `#ORD-${String(id).padStart(4, '0')}`;
};

// Get status badge
const getStatusBadge = (status) => {
  const statusMap = {
    'PENDING': { color: 'orange', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
    'PAID': { color: 'blue', text: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
    'CANCELLED': { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> },
    'COMPLETED': { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> }
  };
  
  const statusInfo = statusMap[status?.toUpperCase()] || { 
    color: 'default', 
    text: status || 'N/A',
    icon: <ClockCircleOutlined />
  };
  
  return (
    <Tag color={statusInfo.color} icon={statusInfo.icon} className="flex items-center gap-1">
      {statusInfo.text}
    </Tag>
  );
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/orders/${id}/invoice`);

        if (response.data.success) {
          const apiData = response.data.data;
          setInvoice({
            id: apiData.orderId,
            orderDate: apiData.orderDate,
            status: apiData.status || apiData.orderStatus || 'PENDING',
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
          setError(response.data.error || 'Không tìm thấy đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching invoice:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Không thể tải thông tin đơn hàng';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    } else {
      setError('Mã đơn hàng không hợp lệ');
      setLoading(false);
    }
  }, [id]);

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
          <div className="font-medium text-gray-900">{text}</div>
          {(record.size || record.color) && (
            <div className="text-sm text-gray-500 mt-1">
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
      render: (quantity) => (
        <span className="font-medium">{quantity}</span>
      ),
    },
    {
      title: 'Đơn giá (chưa VAT)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 150,
      render: (price) => (
        <span className="text-gray-700">{formatCurrency(price)}₫</span>
      ),
    },
    {
      title: 'Thuế suất VAT',
      dataIndex: 'vatRate',
      key: 'vatRate',
      align: 'center',
      width: 120,
      render: (vatRate) => (
        <span className="text-gray-600 font-medium">
          {(vatRate * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      title: 'Tiền VAT',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      align: 'right',
      width: 130,
      render: (vatAmount) => (
        <span className="text-orange-600 font-medium">
          {formatCurrency(vatAmount)}₫
        </span>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      width: 150,
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
          <div className="max-w-6xl mx-auto text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !invoice) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-sm">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/admin')} icon={<ArrowLeftOutlined />}>
                    Về trang quản trị
                  </Button>
                  <Link to="/">
                    <Button type="primary" icon={<HomeOutlined />}>
                      Về trang chủ
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Extract data from invoice structure
  const { customerInfo, items, summary, orderDate, voucher, status } = invoice;

  return (
    <MainLayout>
      <motion.div
        className="py-8 bg-gray-50 min-h-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin')}
              className="mb-4"
            >
              Về trang quản trị
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chi tiết đơn hàng
            </h1>
            <p className="text-gray-600">Xem thông tin chi tiết và hóa đơn VAT của đơn hàng</p>
          </div>

          {/* Order Information Card */}
          <Card className="shadow-sm mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileTextOutlined className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                  <p className="text-xl font-bold text-gray-900">{formatOrderId(invoice.id)}</p>
                </div>
              </div>
              <div className="flex flex-col md:items-end gap-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày đặt hàng</p>
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-gray-400" />
                    <span className="font-medium text-gray-900">{formatDate(orderDate)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  {getStatusBadge(status)}
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Information Card */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">Thông tin khách hàng</span>
              </div>
            }
            className="shadow-sm mb-6 border border-gray-200"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
                    <p className="font-medium text-gray-900">{customerInfo.fullName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MailOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{customerInfo.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneOutlined className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                    <p className="font-medium text-gray-900">{customerInfo.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <HomeOutlined className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ giao hàng</p>
                    <p className="font-medium text-gray-900">{customerInfo.address || 'N/A'}</p>
                  </div>
                </div>
                {customerInfo.customerType === 'business' && (
                  <>
                    {customerInfo.companyName && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tên công ty</p>
                        <p className="font-medium text-gray-900">{customerInfo.companyName}</p>
                      </div>
                    )}
                    {customerInfo.taxCode && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Mã số thuế</p>
                        <p className="font-medium text-gray-900">{customerInfo.taxCode}</p>
                      </div>
                    )}
                  </>
                )}
                {customerInfo.orderNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ghi chú đơn hàng</p>
                    <p className="font-medium text-gray-900">{customerInfo.orderNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Product Table Card */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">Chi tiết sản phẩm</span>
              </div>
            }
            className="shadow-sm mb-6 border border-gray-200"
          >
            <Table
              columns={columns}
              dataSource={items || []}
              pagination={false}
              rowKey={(record, index) => `${record.productId}-${index}`}
              className="admin-order-table"
            />
          </Card>

          {/* VAT Summary Card */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">Tổng kết hóa đơn VAT</span>
              </div>
            }
            className="shadow-sm mb-6 border-2 border-gray-300"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 text-base">
                <span className="text-gray-700">Tạm tính (chưa VAT):</span>
                <span className="text-gray-900 font-semibold">
                  {formatCurrency(summary.subtotal || summary.finalSubtotal + (summary.voucherDiscount || 0))}₫
                </span>
              </div>
              
              {/* Voucher Discount */}
              {voucher && voucher.discount > 0 && (
                <>
                  <Divider className="my-2" />
                  <div className="flex justify-between items-center py-2 text-base">
                    <span className="text-green-700">
                      Giảm giá ({voucher.code}):
                    </span>
                    <span className="text-green-700 font-semibold">
                      -{formatCurrency(voucher.discount)}₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-base">
                    <span className="text-gray-700">
                      Tạm tính sau giảm giá:
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(summary.finalSubtotal || summary.subtotal - voucher.discount)}₫
                    </span>
                  </div>
                </>
              )}
              
              <Divider className="my-2" />
              <div className="flex justify-between items-center py-2 text-base">
                <span className="text-orange-700 font-medium">Tổng tiền VAT:</span>
                <span className="text-orange-700 font-bold text-lg">
                  {formatCurrency(summary.totalVAT)}₫
                </span>
              </div>
              
              <Divider className="my-2" />
              <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
                <span className="text-gray-900 font-bold text-lg">Tổng cộng:</span>
                <span className="text-green-600 font-bold text-2xl">
                  {formatCurrency(summary.total)}₫
                </span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              className="h-11"
            >
              In hóa đơn
            </Button>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin')}
              className="h-11"
            >
              Về trang quản trị
            </Button>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

