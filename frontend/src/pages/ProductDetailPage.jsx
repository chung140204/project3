// Individual product detail page
// Shows full product information, images, and VAT breakdown

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Select, InputNumber, Button, Spin, message } from 'antd';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { getProductImage } from '../utils/productImage';
import { useCart } from '../hooks/useCart';

const sizeOptions = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' }
];

const colorOptions = [
  { value: 'black', label: 'Đen' },
  { value: 'white', label: 'Trắng' },
  { value: 'blue', label: 'Xanh dương' }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/products/${productId}`);
      
      // Handle response structure
      if (response.data.success && response.data.data) {
        setProduct(response.data.data);
      } else if (response.data.id) {
        // Direct product object
        setProduct(response.data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || 'Sản phẩm không tồn tại'}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Get product description with fallback
  const getProductDescription = () => {
    if (product.description && product.description.trim()) {
      return product.description;
    }
    if (product.fullDescription && product.fullDescription.trim()) {
      return product.fullDescription;
    }
    return 'Sản phẩm thời trang chất lượng cao, phù hợp cho nhiều nhu cầu sử dụng hàng ngày.';
  };

  const priceExcludingVAT = parseFloat(product.price) || 0;
  const taxRate = parseFloat(product.tax_rate || 0);
  const vatAmount = priceExcludingVAT * taxRate;
  const totalPrice = priceExcludingVAT + vatAmount;

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
  };

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Image */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-24">
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-gray-100">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            className="w-full space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {/* Product Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              <div className="inline-block px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                {product.category_name || 'Sản phẩm'}
              </div>
            </motion.div>

            {/* Full Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-gray-600 leading-relaxed text-base">
                {getProductDescription()}
              </p>
            </motion.div>

            {/* VAT Breakdown Box */}
            <motion.div
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="space-y-3">
                {/* Price Excluding VAT - De-emphasized */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Giá chưa VAT:
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(priceExcludingVAT)}₫
                  </span>
                </div>
                
                {/* VAT Amount - De-emphasized */}
                {taxRate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      VAT ({(taxRate * 100).toFixed(0)}%):
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatCurrency(vatAmount)}₫
                    </span>
                  </div>
                )}
                
                {/* Total Price - Emphasized */}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Tổng tiền:
                    </span>
                    <span className="text-3xl font-bold text-blue-600">
                      {formatCurrency(totalPrice)}₫
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Options Form */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Tùy chọn sản phẩm
              </h3>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước
                </label>
                <Select
                  value={selectedSize}
                  onChange={setSelectedSize}
                  options={sizeOptions}
                  className="w-full"
                  size="large"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <Select
                  value={selectedColor}
                  onChange={setSelectedColor}
                  options={colorOptions}
                  className="w-full"
                  size="large"
                />
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <InputNumber
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={setQuantity}
                  className="w-full"
                  size="large"
                />
              </div>
            </motion.div>

            {/* Add to Cart Button - Moved closer to VAT summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="primary"
                size="large"
                block
                onClick={handleAddToCart}
                className="h-12 text-base font-semibold transition-all duration-200 hover:shadow-lg"
              >
                Thêm vào giỏ hàng
              </Button>
            </motion.div>

            {/* Additional Info - Shipping/Return Policy */}
            <motion.div
              className="pt-4 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <div className="space-y-2 text-sm text-gray-600">
                <p>✓ Miễn phí vận chuyển cho đơn hàng trên 500.000₫</p>
                <p>✓ Đổi trả trong vòng 7 ngày</p>
                <p>✓ Bảo hành chất lượng sản phẩm</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
