// Customer Order History Page
// Professional e-commerce style (Shopee/Lazada inspired)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Tag, Empty, Spin, message } from 'antd';
import { 
  ShoppingOutlined, 
  FileTextOutlined,
  CalendarOutlined,
  EyeOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

// Format order ID as #ORD-xxxx
const formatOrderId = (id) => {
  return `#ORD-${String(id).padStart(4, '0')}`;
};

// Format date as dd/mm/yyyy
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format amount as VND currency
const formatVND = (amount) => {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Get status badge - Pending (yellow), Completed (green)
const getStatusBadge = (status) => {
  const statusMap = {
    'PENDING': { color: 'gold', text: 'Chờ xử lý' },
    'PAID': { color: 'blue', text: 'Đã thanh toán' },
    'COMPLETED': { color: 'green', text: 'Hoàn thành' },
    'CANCELLED': { color: 'red', text: 'Đã hủy' }
  };
  
  const statusInfo = statusMap[status?.toUpperCase()] || { 
    color: 'default', 
    text: status || 'N/A' 
  };
  
  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      
      // Handle different response structures
      let ordersData = [];
      if (response.data.success) {
        ordersData = response.data.orders || response.data.data || [];
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // If 404, it might mean the endpoint doesn't exist yet - show empty state
      if (error.response?.status !== 404) {
        message.error('Không thể tải lịch sử đơn hàng');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to invoice page
  const handleViewInvoice = (orderId) => {
    navigate(`/orders/${orderId}/invoice`);
  };

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <span className="font-mono font-semibold text-blue-600">
          {formatOrderId(id)}
        </span>
      ),
      width: 130,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date, record) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400 text-xs" />
          <span className="text-gray-700">{formatDate(date || record.order_date)}</span>
        </div>
      ),
      width: 130,
      sorter: (a, b) => {
        const dateA = new Date(a.created_at || a.order_date);
        const dateB = new Date(b.created_at || b.order_date);
        return dateA - dateB;
      },
    },
    {
      title: 'Giá trị đơn',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal) => (
        <span className="font-medium text-gray-700">
          {formatVND(subtotal)}
        </span>
      ),
      align: 'right',
      width: 140,
      sorter: (a, b) => (parseFloat(a.subtotal) || 0) - (parseFloat(b.subtotal) || 0),
    },
    {
      title: 'VAT',
      dataIndex: 'total_vat',
      key: 'total_vat',
      render: (vat) => (
        <span className="font-medium text-orange-600">
          {formatVND(vat)}
        </span>
      ),
      align: 'right',
      width: 140,
      sorter: (a, b) => (parseFloat(a.total_vat) || 0) - (parseFloat(b.total_vat) || 0),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => (
        <span className="font-bold text-green-600 text-base">
          {formatVND(amount)}
        </span>
      ),
      align: 'right',
      width: 160,
      sorter: (a, b) => (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
      width: 140,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewInvoice(record.id)}
          className="rounded"
        >
          Xem hóa đơn
        </Button>
      ),
      align: 'center',
      width: 140,
    },
  ];

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lịch sử mua hàng
            </h1>
            <p className="text-gray-600 text-base">
              Theo dõi các đơn hàng bạn đã đặt
            </p>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 px-4">
                <Empty
                  image={<ShoppingOutlined className="text-6xl text-gray-300" />}
                  description={
                    <div className="space-y-4">
                      <p className="text-gray-500 text-base">
                        Bạn chưa có đơn hàng nào
                      </p>
                      <Link to="/products">
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          className="rounded-lg"
                        >
                          Mua sắm ngay
                        </Button>
                      </Link>
                    </div>
                  }
                />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} đơn hàng`,
                  pageSizeOptions: ['10', '20', '50'],
                }}
                className="customer-orders-table"
                rowClassName="hover:bg-gray-50 transition-colors"
                scroll={{ x: 1000 }}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
