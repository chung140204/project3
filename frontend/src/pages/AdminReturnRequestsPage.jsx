// UC008 – Admin: Approve / Reject Return Requests
// List return requests, detail modal, Approve (green) / Reject (red)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Spin,
  Empty,
  message,
  Tag,
  Space,
  Descriptions,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { formatOrderId, formatVND, formatDateDDMMYYYY } from '../utils/format';

const RETURN_STATUS_MAP = {
  REQUESTED: { label: 'Đang chờ duyệt', color: 'orange' },
  APPROVED: { label: 'Đã chấp nhận', color: 'green' },
  REJECTED: { label: 'Đã từ chối', color: 'red' }
};

// Backend base URL for media (uploads)
const getMediaUrl = (path) => {
  if (!path) return '';
  const base = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
  return path.startsWith('http') ? path : `${base}/${path.replace(/^\//, '')}`;
};

export default function AdminReturnRequestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, orderId: null });

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/return-requests');
      if (res.data.success) {
        setList(res.data.data || []);
      } else {
        message.error(res.data.error || 'Không tải được danh sách');
        setList([]);
      }
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không tải được danh sách');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openDetail = (record) => {
    setSelectedRow(record);
    setDetailModalOpen(true);
  };

  const closeDetail = () => {
    setDetailModalOpen(false);
    setSelectedRow(null);
  };

  const openConfirm = (action, orderId) => {
    setConfirmModal({ open: true, action, orderId });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, action: null, orderId: null });
  };

  const executeAction = async () => {
    const { action, orderId } = confirmModal;
    if (!orderId) return;
    try {
      setActionLoading(true);
      const endpoint =
        action === 'approve'
          ? `/admin/orders/${orderId}/return/approve`
          : `/admin/orders/${orderId}/return/reject`;
      const res = await api.put(endpoint);
      if (res.data.success) {
        message.success(res.data.message || (action === 'approve' ? 'Đã chấp nhận trả hàng.' : 'Đã từ chối yêu cầu.'));
        closeConfirm();
        closeDetail();
        fetchList();
      } else {
        message.error(res.data.error || 'Thao tác thất bại');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Thao tác thất bại';
      message.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
      render: (id) => (
        <span className="font-mono font-semibold text-blue-600">{formatOrderId(id)}</span>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      ellipsis: true
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (t) => (t ? <span title={t}>{t}</span> : '—')
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (d) => (d ? formatDateDDMMYYYY(d) : '—')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'returnStatus',
      key: 'returnStatus',
      width: 140,
      render: (status) => {
        const cfg = RETURN_STATUS_MAP[status] || { label: status, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
          >
            Xem
          </Button>
          {record.returnStatus === 'REQUESTED' && (
            <>
              <Button
                type="link"
                size="small"
                className="text-green-600"
                icon={<CheckCircleOutlined />}
                onClick={() => openConfirm('approve', record.orderId)}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => openConfirm('reject', record.orderId)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const isRequested = selectedRow?.returnStatus === 'REQUESTED';

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeftOutlined /> Về trang quản trị
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UndoOutlined /> Yêu cầu trả hàng
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Duyệt hoặc từ chối yêu cầu trả hàng của khách. Duyệt sẽ hoàn lại tồn kho và ghi nhận hoàn tiền.
              </p>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200 rounded-lg">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : list.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có yêu cầu trả hàng nào"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={list.map((r) => ({ ...r, key: r.id }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (t) => `Tổng ${t} yêu cầu`
                }}
                rowClassName="hover:bg-gray-50"
              />
            )}
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <FileTextOutlined /> Chi tiết yêu cầu trả hàng
            {selectedRow && (
              <Tag color={RETURN_STATUS_MAP[selectedRow.returnStatus]?.color}>
                {RETURN_STATUS_MAP[selectedRow.returnStatus]?.label}
              </Tag>
            )}
          </span>
        }
        open={detailModalOpen}
        onCancel={closeDetail}
        footer={
          isRequested
            ? [
                <Button key="cancel" onClick={closeDetail}>
                  Đóng
                </Button>,
                <Button
                  key="reject"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => openConfirm('reject', selectedRow?.orderId)}
                >
                  Từ chối
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                  icon={<CheckCircleOutlined />}
                  onClick={() => openConfirm('approve', selectedRow?.orderId)}
                >
                  Chấp nhận trả hàng
                </Button>
              ]
            : [
                <Button key="close" type="primary" onClick={closeDetail}>
                  Đóng
                </Button>
              ]
        }
        width={640}
        destroyOnClose
      >
        {selectedRow && (
          <div className="space-y-4">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Mã đơn">
                {formatOrderId(selectedRow.orderId)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedRow.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đơn">
                {selectedRow.orderDate ? formatDateDDMMYYYY(selectedRow.orderDate) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                {formatVND(selectedRow.totalAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do trả hàng">
                <div className="whitespace-pre-wrap">{selectedRow.reason || '—'}</div>
              </Descriptions.Item>
            </Descriptions>

            {selectedRow.mediaUrls && selectedRow.mediaUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh / video đính kèm</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRow.mediaUrls.map((url, i) => {
                    const fullUrl = getMediaUrl(url);
                    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
                    return (
                      <div key={i} className="border rounded overflow-hidden">
                        {isImage ? (
                          <Image
                            width={120}
                            height={120}
                            src={fullUrl}
                            alt={`Đính kèm ${i + 1}`}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 bg-gray-100 text-blue-600 text-sm"
                          >
                            Xem file
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Approve/Reject */}
      <Modal
        title={
          confirmModal.action === 'approve'
            ? 'Xác nhận chấp nhận trả hàng'
            : 'Xác nhận từ chối yêu cầu'
        }
        open={confirmModal.open}
        onCancel={closeConfirm}
        onOk={executeAction}
        confirmLoading={actionLoading}
        okText={confirmModal.action === 'approve' ? 'Chấp nhận' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={
          confirmModal.action === 'reject'
            ? { danger: true }
            : { className: 'bg-green-600 hover:bg-green-700 border-green-600' }
        }
      >
        <p className="text-gray-700">
          {confirmModal.action === 'approve' ? (
            <>
              Bạn sẽ chấp nhận yêu cầu trả hàng. Hệ thống sẽ <strong>hoàn lại tồn kho</strong> và
              ghi nhận <strong>hoàn tiền</strong>. Đơn hàng sẽ được đánh dấu đã hoàn trả.
            </>
          ) : (
            <>Bạn sẽ từ chối yêu cầu trả hàng. Khách hàng sẽ thấy trạng thái &quot;Đã từ chối&quot;.</>
          )}
        </p>
      </Modal>
    </MainLayout>
  );
}
