// Admin Dashboard Page
// Professional e-commerce admin interface for managing orders and VAT

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Row, Col, Button, message, Select, Space, Badge, DatePicker } from 'antd';
import {
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FilterOutlined,
  UserOutlined,
  BarChartOutlined,
  GiftOutlined,
  AppstoreOutlined,
  InboxOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderTable from '../components/admin/OrderTable';
import {
  ORDER_THEME,
  ORDER_LIST_LABELS,
  ORDER_EMPTY_STATE,
  ORDER_MESSAGES,
  ORDER_FILTER_OPTIONS,
} from '../constants/orderAdmin';
import { formatVND } from '../utils/format';

const { RangePicker } = DatePicker;

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
  const [dateRange, setDateRange] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const navigate = useNavigate();

  // Fetch orders data on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when orders or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, dateRange]);

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
      
      // Calculate statistics: chỉ đếm doanh thu và VAT từ đơn PAID/COMPLETED (loại trừ CANCELLED)
      const totalOrders = ordersData.length;
      const ordersForRevenue = ordersData.filter(
        (o) => (o.status || '').toUpperCase() !== 'CANCELLED'
      );
      const totalRevenue = ordersForRevenue.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      const totalVAT = ordersForRevenue.reduce((sum, order) => sum + (parseFloat(order.total_vat) || 0), 0);
      
      setStats({
        totalOrders,
        totalRevenue,
        totalVAT
      });
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      // If 404, it might mean the endpoint doesn't exist yet - show empty state
      if (error.response?.status !== 404) {
        message.error(ORDER_MESSAGES.loadError);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (UI only - no backend call)
  const applyFilters = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('day').toDate();
      const end = dateRange[1].endOf('day').toDate();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at || order.order_date);
        return orderDate >= start && orderDate <= end;
      });
    }

    setFilteredOrders(filtered);
  };

  // Handle view invoice
  const handleViewInvoice = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // UC007: Update order status (backend validates transition rules)
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;
    try {
      setUpdatingOrderId(orderId);
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      message.success(res.data?.message || ORDER_MESSAGES.statusUpdateSuccess);
      await fetchOrders();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data?.error || err.message;
      message.error(msg || ORDER_MESSAGES.statusUpdateError);
    } finally {
      setUpdatingOrderId(null);
    }
  };

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
                      backgroundColor: ORDER_THEME.primary,
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <p className="text-gray-600 text-base">
                  Quản lý đơn hàng & VAT
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  icon={<GiftOutlined />}
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center gap-2"
                >
                  Sản phẩm
                </Button>
                <Button
                  icon={<AppstoreOutlined />}
                  onClick={() => navigate('/admin/categories')}
                  className="flex items-center gap-2"
                >
                  Danh mục
                </Button>
                <Button
                  icon={<UserOutlined />}
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-2"
                >
                  Người dùng
                </Button>
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => navigate('/admin/return-requests')}
                  className="flex items-center gap-2"
                >
                  Yêu cầu trả hàng
                </Button>
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  onClick={() => navigate('/admin/vat-report')}
                  className="flex items-center gap-2"
                >
                  Báo cáo VAT
                </Button>
                {user && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Xin chào,</p>
                    <p className="text-base font-semibold text-gray-900">{user.name || user.email}</p>
                  </div>
                )}
              </div>
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
                      prefix={<ShoppingOutlined style={{ color: ORDER_THEME.primary }} />}
                      valueStyle={{
                        color: ORDER_THEME.primary,
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginTop: '4px',
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
                        color: ORDER_THEME.success,
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginTop: '4px',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalRevenue === 0 ? 'Chưa có doanh thu' : 'Bao gồm cả VAT (không tính đơn đã hủy)'}
                    </p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${ORDER_THEME.success}14` }}
                  >
                    <DollarOutlined style={{ fontSize: 28, color: ORDER_THEME.success }} />
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
                        color: ORDER_THEME.warning,
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginTop: '4px',
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalVAT === 0 ? 'Chưa có VAT' : 'Tổng thuế VAT đã thu (không tính đơn đã hủy)'}
                    </p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${ORDER_THEME.warning}14` }}
                  >
                    <FileTextOutlined style={{ fontSize: 28, color: ORDER_THEME.warning }} />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Orders Table – Card container, professional layout */}
          <Card
            className="rounded-lg shadow-md border border-gray-200 bg-white"
            styles={{ body: { padding: '24px' } }}
            title={
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${ORDER_THEME.primary}14` }}
                  >
                    <InboxOutlined
                      className="text-xl"
                      style={{ color: ORDER_THEME.primary }}
                    />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      {ORDER_LIST_LABELS.cardTitle}
                    </span>
                    {filteredOrders.length !== orders.length && (
                      <Badge
                        count={filteredOrders.length}
                        showZero
                        style={{ backgroundColor: ORDER_THEME.primary, marginLeft: 8 }}
                      />
                    )}
                  </div>
                </div>
                <Space size="middle" wrap>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 160 }}
                    suffixIcon={<FilterOutlined />}
                    options={[
                      { value: 'all', label: ORDER_FILTER_OPTIONS.statusAll },
                      { value: 'PENDING', label: 'Chờ xử lý' },
                      { value: 'PAID', label: 'Đã thanh toán' },
                      { value: 'COMPLETED', label: 'Hoàn thành' },
                      { value: 'CANCELLED', label: 'Đã hủy' },
                    ]}
                  />
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder={ORDER_FILTER_OPTIONS.dateRangePlaceholder}
                    format="DD/MM/YYYY"
                    allowClear
                    suffixIcon={<CalendarOutlined />}
                  />
                </Space>
              </div>
            }
          >
            <OrderTable
              dataSource={filteredOrders}
              loading={loading}
              updatingOrderId={updatingOrderId}
              onViewDetail={handleViewInvoice}
              onStatusChange={handleStatusChange}
              emptyTitle={
                orders.length === 0
                  ? ORDER_EMPTY_STATE.title
                  : ORDER_MESSAGES.noMatchFilter
              }
              emptySubtext={ORDER_EMPTY_STATE.subtext}
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
