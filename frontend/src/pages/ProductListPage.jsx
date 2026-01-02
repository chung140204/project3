// Product listing page
// Displays all available products with filtering and sorting

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Spin } from 'antd';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/product/ProductCard';
import api from '../services/api';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      
      // Handle response structure: { success: true, data: [...] }
      if (response.data.success && response.data.data) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        // Fallback if API returns array directly
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sản phẩm nổi bật
          </h1>
          <p className="text-gray-600">
            Khám phá những sản phẩm thời trang được yêu thích nhất
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Không có sản phẩm nào</p>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
