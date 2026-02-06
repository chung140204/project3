// Admin User Management
// CRUD users (name, email, password, role, phone). Admin only.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Empty,
  message,
  Space,
  Tag
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'ADMIN', label: 'Quản trị' }
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) setData(res.data.data || []);
      else message.error(res.data.error || 'Không tải được danh sách user');
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không tải được danh sách user');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const displayName = (record) => record.full_name || record.name || record.email || '—';

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      full_name: displayName(record),
      email: record.email || '',
      password: '',
      role: record.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      phone: record.phone || ''
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    const payload = {
      full_name: values.full_name?.trim(),
      email: values.email?.trim(),
      role: values.role,
      phone: values.phone?.trim() || undefined
    };
    if (values.password?.trim()) payload.password = values.password.trim();
    try {
      setSubmitLoading(true);
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, payload);
        message.success('Đã cập nhật người dùng');
      } else {
        if (!payload.password) {
          message.error('Mật khẩu là bắt buộc khi tạo mới');
          return;
        }
        await api.post('/admin/users', payload);
        message.success('Đã thêm người dùng');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Có lỗi');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openDeleteConfirm = (record) => {
    setDeleteConfirm({ open: true, id: record.id, name: displayName(record) });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      setSubmitLoading(true);
      await api.delete(`/admin/users/${deleteConfirm.id}`);
      message.success('Đã xóa người dùng');
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không thể xóa');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const columns = [
    {
      title: 'Họ tên',
      key: 'name',
      render: (_, r) => <span className="font-medium">{displayName(r)}</span>,
      sorter: (a, b) => (displayName(a) || '').localeCompare(displayName(b) || '')
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || '')
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (v) => v || '—'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'ADMIN' ? 'blue' : 'default'}>
          {role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}
        </Tag>
      ),
      sorter: (a, b) => (a.role || '').localeCompare(b.role || '')
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: formatDate,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => openDeleteConfirm(record)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftOutlined /> Về trang quản trị
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserOutlined className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                  <p className="text-gray-600 text-sm">Thêm, sửa, xóa tài khoản người dùng</p>
                </div>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                Thêm người dùng
              </Button>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200">
            {loading ? (
              <div className="py-12 text-center">
                <Spin size="large" />
              </div>
            ) : data.length === 0 ? (
              <Empty description="Chưa có người dùng nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={columns}
                dataSource={data.map((r) => ({ ...r, key: r.id }))}
                pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} người dùng` }}
              />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={editingId ? 'Sửa người dùng' : 'Thêm người dùng'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="full_name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nguyễn Văn A" maxLength={255} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="user@example.com" type="email" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingId ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            rules={editingId ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Ít nhất 6 ký tự' }]}
          >
            <Input.Password placeholder={editingId ? 'Để trống = giữ nguyên' : 'Ít nhất 6 ký tự'} />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]} initialValue="CUSTOMER">
            <Select options={ROLE_OPTIONS} placeholder="Chọn vai trò" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitLoading} disabled={submitLoading}>
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
              <Button onClick={() => setModalOpen(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={deleteConfirm.open}
        onOk={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        okText="Xóa"
        okButtonProps={{ danger: true, loading: submitLoading }}
        cancelButtonProps={{ disabled: submitLoading }}
      >
        Bạn có chắc muốn xóa người dùng &quot;{deleteConfirm.name}&quot;? Không thể xóa nếu user đã có đơn hàng hoặc là admin cuối cùng.
      </Modal>
    </MainLayout>
  );
}
