// Product listing page
// Search + filter by category (names from DB)

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Spin, Input, Select, Card, Space, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

const SEARCH_PLACEHOLDER = 'Tìm theo tên hoặc mô tả sản phẩm...';
const CATEGORY_ALL = { value: '', label: 'Tất cả danh mục' };

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qFromUrl = searchParams.get('q') ?? '';
  const categoryIdFromUrl = searchParams.get('category_id') ?? '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState(qFromUrl);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0
  });

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get('/categories');
      const data = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pageFromUrl,
        pageSize: 12
      };
      if (qFromUrl) params.q = qFromUrl;
      if (categoryIdFromUrl) params.category_id = categoryIdFromUrl;
      const response = await api.get('/products', { params });

      if (response.data?.success && response.data?.data != null) {
        setProducts(response.data.data);
        if (response.data.pagination) {
          setPagination({
            total: response.data.pagination.total || 0,
            page: response.data.pagination.page || 1,
            pageSize: response.data.pagination.pageSize || 12,
            totalPages: response.data.pagination.totalPages || 0
          });
        }
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        setPagination({
          total: response.data.length,
          page: 1,
          pageSize: 12,
          totalPages: 1
        });
      } else {
        setProducts([]);
        setPagination({ total: 0, page: 1, pageSize: 12, totalPages: 0 });
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setProducts([]);
      setPagination({ total: 0, page: 1, pageSize: 12, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [qFromUrl, categoryIdFromUrl, pageFromUrl]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync local search input when URL q changes (e.g. from navbar)
  useEffect(() => {
    setSearchInput(qFromUrl);
  }, [qFromUrl]);

  const handleSearchChange = (e) => {
    const v = e.target?.value ?? '';
    setSearchInput(v);
  };

  const handleSearchSubmit = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput.trim()) {
        next.set('q', searchInput.trim());
      } else {
        next.delete('q');
      }
      next.delete('page'); // Reset về trang 1 khi search
      return next;
    });
  };

  const handleCategoryChange = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set('category_id', value);
      } else {
        next.delete('category_id');
      }
      next.delete('page'); // Reset về trang 1 khi đổi filter
      return next;
    });
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page > 1) {
        next.set('page', String(page));
      } else {
        next.delete('page');
      }
      return next;
    });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryOptions = [
    CATEGORY_ALL,
    ...categories.map((c) => ({ value: String(c.id), label: c.name }))
  ];

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sản phẩm nổi bật
          </h1>
          <p className="text-gray-600">
            Khám phá những sản phẩm thời trang được yêu thích nhất
          </p>
        </div>

        {/* Search + Category filter */}
        <Card className="mb-6 rounded-lg shadow-sm border border-gray-200" styles={{ body: { padding: 16 } }}>
          <Space wrap size="middle" className="w-full">
            <Input
              placeholder={SEARCH_PLACEHOLDER}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchInput}
              onChange={handleSearchChange}
              onPressEnter={handleSearchSubmit}
              onBlur={handleSearchSubmit}
              allowClear
              className="max-w-md"
              style={{ minWidth: 240 }}
            />
            <Select
              placeholder="Danh mục"
              suffixIcon={<FilterOutlined />}
              value={categoryIdFromUrl || undefined}
              onChange={handleCategoryChange}
              options={categoryOptions}
              loading={categoriesLoading}
              allowClear
              className="min-w-[180px]"
            />
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Tìm kiếm
            </button>
          </Space>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-gray-500 text-sm mb-4">
            Hiển thị {products.length} / {pagination.total} sản phẩm
            {(qFromUrl || categoryIdFromUrl) && ' (đã lọc)'}
            {pagination.totalPages > 1 && ` - Trang ${pagination.page}/${pagination.totalPages}`}
          </p>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            <p className="text-gray-400 text-sm mt-1">
              Thử đổi từ khóa hoặc danh mục
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
              className="pagination-custom"
            />
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
