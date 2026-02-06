// Admin VAT Report Page
// Professional admin interface for viewing VAT statistics

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Table, Spin, Empty, message, Row, Col, Tag } from 'antd';
import { 
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  RiseOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

// Format amount as VND currency
const formatVND = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format month display (YYYY-MM -> Tháng MM/YYYY)
const formatMonth = (monthString) => {
  if (!monthString) return 'N/A';
  const [year, month] = monthString.split('-');
  return `Tháng ${month}/${year}`;
};

export default function AdminVATReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVATReport();
  }, []);

  const fetchVATReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/vat-report');
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.error || 'Không thể tải báo cáo VAT');
        message.error('Không thể tải báo cáo VAT');
      }
    } catch (err) {
      console.error('Error fetching VAT report:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Không thể tải báo cáo VAT';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Table columns for VAT by month
  const monthColumns = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      render: (month) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <span className="font-medium text-gray-900">{formatMonth(month)}</span>
        </div>
      ),
      sorter: (a, b) => a.month.localeCompare(b.month),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'VAT thu được',
      dataIndex: 'vat',
      key: 'vat',
      align: 'right',
      render: (vat) => (
        <span className="font-semibold text-orange-600 text-base">
          {formatVND(vat)}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.vat) - parseFloat(b.vat),
    },
  ];

  // Table columns for VAT by category
  const categoryColumns = [
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-gray-400" />
          <span className="font-medium text-gray-900">{name || 'N/A'}</span>
        </div>
      ),
      sorter: (a, b) => (a.category_name || '').localeCompare(b.category_name || ''),
    },
    {
      title: 'VAT thu được',
      dataIndex: 'vat',
      key: 'vat',
      align: 'right',
      render: (vat) => (
        <span className="font-semibold text-orange-600 text-base">
          {formatVND(vat)}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.vat) - parseFloat(b.vat),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="py-20">
          <div className="max-w-7xl mx-auto text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tải báo cáo VAT...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !reportData) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeftOutlined /> Về trang quản trị
              </button>
            </div>
            <Card className="shadow-sm">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 mb-4">{error || 'Không thể tải báo cáo VAT'}</p>
                <button
                  onClick={fetchVATReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftOutlined /> Về trang quản trị
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChartOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Báo cáo VAT
                </h1>
                <p className="text-gray-600">Thống kê và phân tích thuế GTGT đã thu</p>
              </div>
            </div>
          </div>

          {/* Total VAT Summary Card */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={24} lg={24}>
              <Card className="shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <Statistic
                      title="Tổng VAT đã thu"
                      value={reportData.totalVAT}
                      valueStyle={{ 
                        color: '#f59e0b', 
                        fontSize: '32px', 
                        fontWeight: 'bold' 
                      }}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatVND(value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Tổng hợp từ tất cả đơn hàng (không bao gồm đơn đã hủy)
                    </p>
                  </div>
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarOutlined className="text-orange-600 text-4xl" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ Doanh thu & Số lượng sản phẩm đã bán */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <RiseOutlined className="text-green-600" />
                    <span className="text-lg font-semibold">Doanh thu theo tháng</span>
                  </div>
                }
                className="shadow-sm border border-gray-200 h-full"
              >
                {reportData.revenueByMonth && reportData.revenueByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={reportData.revenueByMonth.map((d) => ({
                        ...d,
                        monthLabel: formatMonth(d.month),
                        revenueLabel: formatVND(d.revenue)
                      }))}
                      margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [formatVND(value), 'Doanh thu']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.monthLabel}
                      />
                      <Bar dataKey="revenue" name="Doanh thu" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Chưa có dữ liệu doanh thu theo tháng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingOutlined className="text-blue-600" />
                    <span className="text-lg font-semibold">Số lượng sản phẩm đã bán theo tháng</span>
                  </div>
                }
                className="shadow-sm border border-gray-200 h-full"
              >
                {reportData.quantityByMonth && reportData.quantityByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={reportData.quantityByMonth.map((d) => ({
                        ...d,
                        monthLabel: formatMonth(d.month)
                      }))}
                      margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Số lượng']}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.monthLabel}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="quantity"
                        name="Số lượng SP"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Chưa có dữ liệu số lượng bán theo tháng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>

          {/* VAT by Month Table */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">VAT theo tháng</span>
              </div>
            }
            className="shadow-sm mb-6 border border-gray-200"
          >
            {reportData.vatByMonth && reportData.vatByMonth.length > 0 ? (
              <Table
                columns={monthColumns}
                dataSource={reportData.vatByMonth.map((item, index) => ({
                  ...item,
                  key: `month-${index}`,
                }))}
                pagination={{
                  pageSize: 12,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} tháng`,
                }}
                className="admin-vat-table"
              />
            ) : (
              <Empty
                description="Chưa có dữ liệu VAT theo tháng"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* VAT by Category Table */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-blue-600" />
                <span className="text-lg font-semibold">VAT theo danh mục sản phẩm</span>
              </div>
            }
            className="shadow-sm mb-6 border border-gray-200"
          >
            {reportData.vatByCategory && reportData.vatByCategory.length > 0 ? (
              <Table
                columns={categoryColumns}
                dataSource={reportData.vatByCategory.map((item, index) => ({
                  ...item,
                  key: `category-${index}`,
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} danh mục`,
                }}
                className="admin-vat-table"
              />
            ) : (
              <Empty
                description="Chưa có dữ liệu VAT theo danh mục"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>

          {/* Info Note */}
          <Card className="shadow-sm border border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <FileTextOutlined className="text-blue-600 text-lg mt-1" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Lưu ý về dữ liệu VAT
                </p>
                <p className="text-sm text-blue-700">
                  Dữ liệu VAT được tính từ <strong>order_items.tax_amount</strong> (snapshot tại thời điểm đặt hàng) 
                  để đảm bảo tính chính xác lịch sử. Các đơn hàng có trạng thái <strong>CANCELLED</strong> 
                  đã được loại trừ khỏi báo cáo.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}


