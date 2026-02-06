// UC003 – Order Tracking (Customer)
// Page: /orders – View order history, status, link to invoice

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Table, Button, Empty, Spin, message } from 'antd';
import { ShoppingOutlined, ShoppingCartOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import OrderStatusBadge from '../components/admin/OrderStatusBadge';
import { formatOrderId, formatDateDDMMYYYY, formatVND } from '../utils/format';
import { ORDER_THEME } from '../constants/orderAdmin';
import { ORDER_TRACKING_LABELS } from '../constants/orderCustomer';

const LABELS = ORDER_TRACKING_LABELS;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const data = response.data?.data ?? response.data?.orders ?? (Array.isArray(response.data) ? response.data : []);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status !== 404) {
        message.error(LABELS.loadError);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (orderId) => {
    navigate(`/orders/${orderId}/invoice`);
  };

  const columns = [
    {
      title: LABELS.orderId,
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id) => (
        <button
          type="button"
          onClick={() => handleViewInvoice(id)}
          className="font-mono font-semibold text-left bg-transparent border-none cursor-pointer hover:underline p-0"
          style={{ color: ORDER_THEME.primary }}
        >
          {formatOrderId(id)}
        </button>
      ),
    },
    {
      title: LABELS.date,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      sorter: (a, b) =>
        new Date(a.created_at || a.order_date) - new Date(b.created_at || b.order_date),
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400 text-xs" />
          <span className="text-gray-700">{formatDateDDMMYYYY(record.created_at || record.order_date)}</span>
        </div>
      ),
    },
    {
      title: LABELS.status,
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => <OrderStatusBadge status={status} />,
    },
    {
      title: LABELS.totalAmount,
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 160,
      align: 'right',
      sorter: (a, b) => (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0),
      render: (amount) => (
        <span className="font-bold tabular-nums" style={{ color: ORDER_THEME.success }}>
          {formatVND(amount)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewInvoice(record.id)}
          className="rounded"
        >
          {LABELS.viewInvoice}
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{LABELS.pageTitle}</h1>
            <p className="text-gray-600 text-sm mt-1">{LABELS.pageSubtitle}</p>
            <p className="text-gray-500 text-xs mt-1">
              Bấm vào <strong>mã đơn</strong> hoặc nút <strong>Xem hóa đơn</strong> để xem chi tiết và hóa đơn.
            </p>
          </div>

          <Card className="rounded-lg shadow-md border border-gray-200 bg-white" styles={{ body: { padding: 24 } }}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : orders.length === 0 ? (
              <Empty
                image={<ShoppingOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                description={
                  <div className="text-center">
                    <p className="font-medium text-gray-700 text-base">{LABELS.emptyTitle}</p>
                    <p className="text-gray-500 text-sm mt-1">{LABELS.emptySubtext}</p>
                    <Link to="/products" className="inline-block mt-4">
                      <Button type="primary" size="large" icon={<ShoppingCartOutlined />} className="rounded-lg">
                        {LABELS.shopNow}
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <Table
                columns={columns}
                dataSource={orders.map((r) => ({ ...r, key: r.id }))}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn`,
                  pageSizeOptions: ['10', '20', '50'],
                }}
                rowClassName="hover:bg-gray-50 transition-colors"
              />
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
