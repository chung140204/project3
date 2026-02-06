import { Tag } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { ORDER_STATUS_CONFIG } from '../../constants/orderAdmin';

const STATUS_ICONS = {
  PENDING: <ClockCircleOutlined />,
  PAID: <CheckCircleOutlined />,
  COMPLETED: <CheckCircleOutlined />,
  CANCELLED: <CloseCircleOutlined />,
};

export default function OrderStatusBadge({ status }) {
  const key = (status || '').toUpperCase();
  const config = ORDER_STATUS_CONFIG[key] || {
    tagColor: 'default',
    label: status || 'N/A',
  };
  const icon = STATUS_ICONS[key] || STATUS_ICONS.PENDING;

  return (
    <Tag color={config.tagColor} icon={icon} className="inline-flex items-center gap-1">
      {config.label}
    </Tag>
  );
}
