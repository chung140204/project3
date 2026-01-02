// Admin Dashboard Page
// Professional e-commerce admin interface for managing orders and VAT

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Row, Col, Table, Button, Spin, Empty, message, Tag, Select, Space, Badge } from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  FileTextOutlined,
  EyeOutlined,
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalVAT: 0
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch orders data on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      
      // Handle different response structures
      let ordersData = [];
      if (response.data.success) {
        ordersData = response.data.orders || response.data.data || [];
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      }
      
      setOrders(ordersData);
      
      // Calculate statistics
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const totalVAT = ordersData.reduce((sum, order) => sum + (parseFloat(order.total_vat) || 0), 0);
      
      setStats({
        totalOrders,
        totalRevenue,
        totalVAT
      });
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      // If 404, it might mean the endpoint doesn't exist yet - show empty state
      if (error.response?.status !== 404) {
        message.error('Không thể tải dữ liệu đơn hàng');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (UI only - no backend call)
  const applyFilters = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Filter by date range
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at || order.order_date);
        
        if (dateFilter === 'today') {
          return orderDate >= today;
        } else if (dateFilter === 'last7days') {
          const last7Days = new Date(today);
          last7Days.setDate(last7Days.getDate() - 7);
          return orderDate >= last7Days;
        }
        return true;
      });
    }

    setFilteredOrders(filtered);
  };

  // Handle view invoice
  const handleViewInvoice = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
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
      fixed: 'left',
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span className="font-medium text-gray-900">{name || 'N/A'}</span>
        </div>
      ),
      width: 180,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400 text-xs" />
          <span className="text-gray-600">{formatDate(date)}</span>
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
      filters: [
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đã thanh toán', value: 'PAID' },
        { text: 'Hoàn thành', value: 'COMPLETED' },
        { text: 'Đã hủy', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status === value,
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
          Xem chi tiết
        </Button>
      ),
      align: 'center',
      width: 140,
      fixed: 'right',
    },
  ];

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header with Admin Badge */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Trang quản trị
                  </h1>
                  <Badge 
                    count="ADMIN" 
                    style={{ 
                      backgroundColor: '#1890ff',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <p className="text-gray-600 text-base">
                  Quản lý đơn hàng & VAT
                </p>
              </div>
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Xin chào,</p>
                  <p className="text-base font-semibold text-gray-900">{user.name || user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards - Improved */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Statistic
                      title={
                        <span className="text-gray-600 text-sm font-medium">
                          Tổng đơn hàng
                        </span>
                      }
                      value={stats.totalOrders}
                      prefix={<ShoppingOutlined className="text-blue-600" />}
                      valueStyle={{ 
                        color: '#1890ff', 
                        fontSize: '28px', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalOrders === 0 ? 'Chưa có đơn hàng nào' : 'Tất cả đơn hàng trong hệ thống'}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ShoppingOutlined className="text-3xl text-blue-600" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Statistic
                      title={
                        <span className="text-gray-600 text-sm font-medium">
                          Tổng doanh thu
                        </span>
                      }
                      value={stats.totalRevenue}
                      prefix={<DollarOutlined className="text-green-600" />}
                      formatter={(value) => formatVND(value)}
                      valueStyle={{ 
                        color: '#52c41a', 
                        fontSize: '28px', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalRevenue === 0 ? 'Chưa có doanh thu' : 'Bao gồm cả VAT'}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                    <DollarOutlined className="text-3xl text-green-600" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Statistic
                      title={
                        <span className="text-gray-600 text-sm font-medium">
                          Tổng VAT thu được
                        </span>
                      }
                      value={stats.totalVAT}
                      prefix={<FileTextOutlined className="text-orange-600" />}
                      formatter={(value) => formatVND(value)}
                      valueStyle={{ 
                        color: '#fa8c16', 
                        fontSize: '28px', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalVAT === 0 ? 'Chưa có VAT' : 'Tổng thuế VAT đã thu'}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-orange-50 rounded-lg flex items-center justify-center">
                    <FileTextOutlined className="text-3xl text-orange-600" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Orders Table with Filters */}
          <Card 
            className="shadow-sm border border-gray-200 rounded-lg"
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingOutlined className="text-blue-600 text-lg" />
                  <span className="text-lg font-semibold">Danh sách đơn hàng</span>
                  {filteredOrders.length !== orders.length && (
                    <Badge count={filteredOrders.length} showZero style={{ backgroundColor: '#1890ff' }} />
                  )}
                </div>
                <Space size="middle">
                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 150 }}
                    prefixCls="ant-select"
                    suffixIcon={<FilterOutlined />}
                  >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="PENDING">Chờ xử lý</Select.Option>
                    <Select.Option value="PAID">Đã thanh toán</Select.Option>
                    <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                    <Select.Option value="CANCELLED">Đã hủy</Select.Option>
                  </Select>
                  
                  {/* Date Range Filter */}
                  <Select
                    value={dateFilter}
                    onChange={setDateFilter}
                    style={{ width: 150 }}
                    prefixCls="ant-select"
                    suffixIcon={<CalendarOutlined />}
                  >
                    <Select.Option value="all">Tất cả thời gian</Select.Option>
                    <Select.Option value="today">Hôm nay</Select.Option>
                    <Select.Option value="last7days">7 ngày qua</Select.Option>
                  </Select>
                </Space>
              </div>
            }
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Empty
                description={
                  orders.length === 0 
                    ? "Chưa có đơn hàng nào" 
                    : "Không có đơn hàng nào phù hợp với bộ lọc"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} đơn hàng`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                className="admin-orders-table"
                rowClassName="hover:bg-gray-50 transition-colors"
                scroll={{ x: 1200 }}
              />
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
