import { Table, Empty, Spin, Avatar } from 'antd';
import { CalendarOutlined, UserOutlined } from '@ant-design/icons';
import OrderStatusBadge from './OrderStatusBadge';
import OrderActions from './OrderActions';
import { ORDER_LIST_LABELS, ORDER_EMPTY_STATE, ORDER_THEME } from '../../constants/orderAdmin';
import { formatOrderId, formatDateDDMMYYYY, formatVND } from '../../utils/format';

const moneyClassName = 'tabular-nums';

export default function OrderTable({
  dataSource,
  loading,
  updatingOrderId,
  onViewDetail,
  onStatusChange,
  emptyTitle,
  emptySubtext,
}) {
  const columns = [
    {
      title: ORDER_LIST_LABELS.orderId,
      dataIndex: 'id',
      key: 'id',
      width: 130,
      fixed: 'left',
      render: (id, record) => (
        <button
          type="button"
          onClick={() => onViewDetail(record.id)}
          className="font-mono font-semibold text-left bg-transparent border-none cursor-pointer hover:underline p-0"
          style={{ color: ORDER_THEME.primary }}
        >
          {formatOrderId(id)}
        </button>
      ),
    },
    {
      title: ORDER_LIST_LABELS.customer,
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 180,
      render: (name) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} className="bg-gray-200 text-gray-600" />
          <span className="font-medium text-gray-900">{name || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: ORDER_LIST_LABELS.orderDate,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      sorter: (a, b) =>
        new Date(a.created_at || a.order_date) - new Date(b.created_at || b.order_date),
      render: (_, record) => {
        const date = record.created_at || record.order_date;
        return (
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-gray-400 text-xs" />
            <span className="text-gray-600">{formatDateDDMMYYYY(date)}</span>
          </div>
        );
      },
    },
    {
      title: ORDER_LIST_LABELS.subtotal,
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 140,
      align: 'right',
      sorter: (a, b) => (parseFloat(a.subtotal) || 0) - (parseFloat(b.subtotal) || 0),
      render: (val) => (
        <span className={`font-medium text-gray-700 ${moneyClassName}`}>
          {formatVND(val)}
        </span>
      ),
    },
    {
      title: ORDER_LIST_LABELS.vat,
      dataIndex: 'total_vat',
      key: 'total_vat',
      width: 140,
      align: 'right',
      sorter: (a, b) => (parseFloat(a.total_vat) || 0) - (parseFloat(b.total_vat) || 0),
      render: (val) => (
        <span className={`font-medium ${moneyClassName}`} style={{ color: ORDER_THEME.warning }}>
          {formatVND(val)}
        </span>
      ),
    },
    {
      title: ORDER_LIST_LABELS.total,
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 160,
      align: 'right',
      sorter: (a, b) =>
        (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0),
      render: (val) => (
        <span
          className={`font-bold text-base ${moneyClassName}`}
          style={{ color: ORDER_THEME.success }}
        >
          {formatVND(val)}
        </span>
      ),
    },
    {
      title: ORDER_LIST_LABELS.status,
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => <OrderStatusBadge status={status} />,
    },
    {
      title: ORDER_LIST_LABELS.actions,
      key: 'action',
      width: 220,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <OrderActions
          record={record}
          updatingOrderId={updatingOrderId}
          onStatusChange={onStatusChange}
          onViewDetail={onViewDetail}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!dataSource?.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        styles={{ image: { height: 80 } }}
        description={
          <div className="text-center">
            <p className="font-semibold text-gray-700 text-base">
              {emptyTitle ?? ORDER_EMPTY_STATE.title}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {emptySubtext ?? ORDER_EMPTY_STATE.subtext}
            </p>
          </div>
        }
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={dataSource.map((row) => ({ ...row, key: row.id }))}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      scroll={{ x: 1200 }}
      className="admin-order-table"
      rowClassName="hover:bg-gray-100/80 transition-colors"
    />
  );
}
