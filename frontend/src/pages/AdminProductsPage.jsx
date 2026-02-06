// Admin Product Management (UC006)
// CRUD products. VAT from category. Admin only.

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
  Select,
  Spin,
  Empty,
  message,
  Space,
  Tag,
  Image
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { getProductImage } from '../utils/productImage';

const formatVND = (amount) => {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/products');
      if (res.data.success) setProducts(res.data.data || []);
      else message.error(res.data.error || 'Không tải được sản phẩm');
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không tải được sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.success) setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE', stock: 0 });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description || '',
      price: record.price,
      stock: record.stock,
      status: record.status || 'ACTIVE',
      image: record.image || '',
      category_id: record.category_id,
      sku: record.sku || ''
    });
    setModalOpen(true);
  };

  const onFinish = async (values) => {
    const payload = {
      name: values.name?.trim(),
      description: values.description?.trim() || null,
      price: Number(values.price),
      stock: values.stock != null ? parseInt(values.stock, 10) : 0,
      status: values.status,
      image: values.image?.trim() || null,
      category_id: values.category_id,
      sku: values.sku?.trim() || null
    };
    if (payload.price <= 0) {
      message.error('Giá phải lớn hơn 0');
      return;
    }
    if (payload.stock < 0) {
      message.error('Tồn kho phải ≥ 0');
      return;
    }
    try {
      setSubmitLoading(true);
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        message.success('Đã cập nhật sản phẩm');
      } else {
        await api.post('/admin/products', payload);
        message.success('Đã thêm sản phẩm');
      }
      setModalOpen(false);
      fetchProducts();
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
      await api.delete(`/admin/products/${deleteConfirm.id}`);
      message.success('Đã xóa sản phẩm');
      setDeleteConfirm({ open: false, id: null, name: '' });
      fetchProducts();
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Không thể xóa');
    } finally {
      setSubmitLoading(false);
    }
  };

  const selectedCategoryTax = Form.useWatch('category_id', form)
    ? (categories.find((c) => c.id === form.getFieldValue('category_id'))?.tax_rate ?? null)
    : null;

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: (_, record) => (
        <Image
          src={getProductImage(record, 400)}
          alt={record.name}
          width={56}
          height={56}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect fill='%23f0f0f0' width='56' height='56'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='10'%3ENo image%3C/text%3E%3C/svg%3E"
        />
      )
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium">{name}</span>,
      ellipsis: true
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (p) => formatVND(p)
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name'
    },
    {
      title: 'VAT',
      dataIndex: 'tax_rate',
      key: 'tax_rate',
      align: 'center',
      render: (rate) => (rate != null ? <Tag color="blue">{Math.round(Number(rate) * 100)}%</Tag> : '–')
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      width: 90
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (s) => (
        <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>
          {s === 'ACTIVE' ? 'Đang bán' : 'Ẩn'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      width: 140,
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
        <div className="max-w-7xl mx-auto px-4">
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingOutlined className="text-green-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
                  <p className="text-gray-600 text-sm">Thêm, sửa, xóa sản phẩm. VAT lấy từ danh mục.</p>
                </div>
              </div>
              <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          <Card className="shadow-sm border border-gray-200">
            {loading ? (
              <div className="py-12 text-center">
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Empty description="Chưa có sản phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={columns}
                dataSource={products.map((r) => ({ ...r, key: r.id }))}
                pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} sản phẩm` }}
                scroll={{ x: 900 }}
              />
            )}
          </Card>
        </div>
      </div>

      <Modal
        title={editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Tên sản phẩm" maxLength={255} />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả (tùy chọn)" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập giá' },
              { type: 'number', min: 1, message: 'Giá phải lớn hơn 0' }
            ]}
          >
            <InputNumber placeholder="100000" min={1} className="w-full" addonAfter="₫" />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Tồn kho"
            rules={[{ type: 'number', min: 0, message: 'Tồn kho ≥ 0' }]}
          >
            <InputNumber placeholder="0" min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select
              placeholder="Chọn danh mục"
              showSearch
              optionFilterProp="label"
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.name} (VAT ${Math.round(Number(c.tax_rate) * 100)}%)`
              }))}
            />
          </Form.Item>
          {selectedCategoryTax != null && (
            <div className="mb-4 text-sm text-gray-600">
              VAT áp dụng: <Tag color="blue">{Math.round(Number(selectedCategoryTax) * 100)}%</Tag> (từ danh mục)
            </div>
          )}
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'ACTIVE', label: 'Đang bán' },
                { value: 'INACTIVE', label: 'Ẩn' }
              ]}
            />
          </Form.Item>
          <Form.Item name="image" label="URL ảnh">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sku" label="Mã SKU">
            <Input placeholder="Tùy chọn" />
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
        Bạn có chắc muốn xóa sản phẩm &quot;{deleteConfirm.name}&quot;?
      </Modal>
    </MainLayout>
  );
}
