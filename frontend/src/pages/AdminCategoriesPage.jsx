// Admin Category Management (UC006)
// CRUD categories with VAT (tax_rate). Admin only.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Spin,
  Empty,
  message,
  Space,
  Tag
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

// VAT: UI shows percentage (10), backend expects decimal (0.1)
const percentToDecimal = (percent) => (percent == null || percent === '') ? undefined : Number(percent) / 100;
const decimalToPercent = (decimal) => (decimal == null || decimal === '') ? '' : Math.round(Number(decimal) * 100);

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      if (res.data.success) setData(res.data.data || []);
      else message.error(res.data.error || 'Không tải được danh mục');
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không tải được danh mục');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      tax_rate_percent: decimalToPercent(record.tax_rate)
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    const taxRateDecimal = percentToDecimal(values.tax_rate_percent);
    if (taxRateDecimal == null || taxRateDecimal < 0 || taxRateDecimal > 1) {
      message.error('VAT phải từ 0% đến 100%');
      return;
    }
    try {
      setSubmitLoading(true);
      const payload = { name: values.name.trim(), tax_rate: taxRateDecimal };
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload);
        message.success('Đã cập nhật danh mục');
      } else {
        await api.post('/admin/categories', payload);
        message.success('Đã thêm danh mục');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Có lỗi');
    } finally {
      setSubmitLoading(false);
    }
  };

  const openDeleteConfirm = (record) => {
    setDeleteConfirm({ open: true, id: record.id, name: record.name });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      setSubmitLoading(true);
      await api.delete(`/admin/categories/${deleteConfirm.id}`);
      message.success('Đã xóa danh mục');
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchCategories();
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
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium">{name}</span>,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || '')
    },
    {
      title: 'VAT (%)',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      align: 'right',
      render: (rate) => <Tag color="blue">{decimalToPercent(rate)}%</Tag>,
      sorter: (a, b) => (parseFloat(a.tax_rate) || 0) - (parseFloat(b.tax_rate) || 0)
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
                  <AppstoreOutlined className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
                  <p className="text-gray-600 text-sm">Thêm, sửa, xóa danh mục và thuế VAT theo danh mục</p>
                </div>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                Thêm danh mục
              </Button>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200">
            {loading ? (
              <div className="py-12 text-center">
                <Spin size="large" />
              </div>
            ) : data.length === 0 ? (
              <Empty description="Chưa có danh mục nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={columns}
                dataSource={data.map((r) => ({ ...r, key: r.id }))}
                pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} danh mục` }}
              />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Áo, Quần" maxLength={255} />
          </Form.Item>
          <Form.Item
            name="tax_rate_percent"
            label="VAT (%)"
            rules={[
              { required: true, message: 'Vui lòng nhập VAT' },
              { type: 'number', min: 0, max: 100, message: 'VAT từ 0 đến 100' }
            ]}
          >
            <InputNumber placeholder="10" min={0} max={100} step={1} className="w-full" addonAfter="%" />
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
        Bạn có chắc muốn xóa danh mục &quot;{deleteConfirm.name}&quot;? Không thể xóa nếu danh mục còn sản phẩm.
      </Modal>
    </MainLayout>
  );
}
