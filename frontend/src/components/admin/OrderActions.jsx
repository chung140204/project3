import { Button, Select, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { ORDER_STATUS_CONFIG, ORDER_LIST_LABELS } from '../../constants/orderAdmin';

export default function OrderActions({
  record,
  updatingOrderId,
  onStatusChange,
  onViewDetail,
}) {
  const allowed = record.allowed_statuses || [];
  const disabled = allowed.length === 0 || updatingOrderId === record.id;
  const options = allowed.map((s) => ({
    value: s,
    label: ORDER_STATUS_CONFIG[s]?.label || s,
  }));

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Select
        placeholder={ORDER_LIST_LABELS.updateStatus}
        options={options}
        disabled={disabled}
        loading={updatingOrderId === record.id}
        onChange={(value) => onStatusChange(record.id, value)}
        style={{ width: '100%', minWidth: 160 }}
        allowClear={false}
      />
      <Button
        type="primary"
        icon={<EyeOutlined />}
        size="small"
        onClick={() => onViewDetail(record.id)}
        className="rounded"
        block
      >
        {ORDER_LIST_LABELS.viewDetail}
      </Button>
    </Space>
  );
}
