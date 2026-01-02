// Individual product card component
// Displays product image, name, price, and VAT information

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Modal, InputNumber, message, Button } from 'antd';
import { getProductImage } from '../../utils/productImage';
import { useCart } from '../../hooks/useCart';

// Mock descriptions for products without description
const getProductDescription = (product) => {
  if (product.description) {
    return product.description;
  }
  
  // Fallback descriptions based on category
  const categoryDescriptions = {
    'Áo': 'Chất liệu cao cấp, thiết kế hiện đại, phù hợp mọi dịp',
    'Quần': 'Form dáng đẹp, chất liệu bền, dễ phối đồ',
    'Phụ kiện': 'Thiết kế tinh tế, chất lượng tốt, giá cả hợp lý'
  };
  
  return categoryDescriptions[product.category_name] || 'Sản phẩm thời trang chất lượng cao, phù hợp mọi lứa tuổi';
};

export default function ProductCard({ product }) {
  const description = getProductDescription(product);
  const { addToCart } = useCart();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);

  // Parse price and tax_rate as numbers to ensure correct calculation
  const priceExcludingVAT = parseFloat(product.price) || 0;
  const taxRate = parseFloat(product.tax_rate) || 0;
  
  // Calculate VAT amount and total price
  const vatAmount = priceExcludingVAT * taxRate;
  const totalPriceIncludingVAT = priceExcludingVAT + vatAmount;
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Size options
  const sizeOptions = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' }
  ];

  // Color options with hex values for swatches
  const colorOptions = [
    { value: 'black', label: 'Đen', hex: '#000000' },
    { value: 'white', label: 'Trắng', hex: '#FFFFFF' },
    { value: 'blue', label: 'Xanh dương', hex: '#3B82F6' }
  ];

  // Handle add to cart button click
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // Handle modal confirm
  const handleModalConfirm = () => {
    addToCart(product, {
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });
    
    message.success('Đã thêm sản phẩm vào giỏ hàng!');
    setIsModalOpen(false);
    
    // Reset form
    setSelectedSize('M');
    setSelectedColor('black');
    setQuantity(1);
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  // Calculate total price for selected quantity
  const totalPriceForQuantity = totalPriceIncludingVAT * quantity;
  const vatAmountForQuantity = vatAmount * quantity;

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Link to={`/products/${product.id}`} className="block">
        <motion.div
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
          whileHover={{ y: -5, scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Product Image */}
          <div className="aspect-square bg-gray-200 overflow-hidden">
            <img
              src={getProductImage(product, 400)}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          {/* Product Info */}
          <div className="p-4">
            {/* Product Title - Bold, Prominent */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            
            {/* Product Description - Smaller, Gray */}
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
              {description}
            </p>
            
            {/* Price Section */}
            <div className="space-y-1.5 mb-4">
              {/* Price excluding VAT - smaller, gray */}
              <div className="text-xs text-gray-500">
                Giá chưa VAT: {formatCurrency(priceExcludingVAT)}₫
              </div>
              
              {/* VAT Rate */}
              {taxRate > 0 && (
                <div className="text-xs text-gray-600">
                  VAT: {(taxRate * 100).toFixed(0)}%
                </div>
              )}
              
              {/* Total price including VAT - large, bold */}
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalPriceIncludingVAT)}₫
              </div>
            </div>
            
            {/* Category Badge and Cart Icon - Aligned horizontally */}
            <div className="flex items-center justify-between">
              {/* Category Badge - Left */}
              {product.category_name && (
                <span className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  {product.category_name}
                </span>
              )}
              
              {/* Cart Icon Button - Right, Circular */}
              <button
                onClick={handleAddToCartClick}
                className="w-10 h-10 bg-white hover:bg-blue-50 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg border border-gray-200 group"
                aria-label="Thêm vào giỏ hàng"
              >
                <ShoppingCartOutlined className="text-lg text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Add to Cart Modal */}
      <Modal
        title="Thêm vào giỏ hàng"
        open={isModalOpen}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
        okText="Thêm vào giỏ hàng"
        cancelText="Hủy"
        okButtonProps={{ type: 'primary', size: 'large', className: 'h-12' }}
        cancelButtonProps={{ size: 'large', className: 'h-12' }}
        width={700}
        styles={{
          content: {
            borderRadius: '12px'
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <div className="py-4">
          {/* Product Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-gray-200">
            {/* Left Column: Product Image */}
            <div className="flex-shrink-0">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                <img
                  src={getProductImage(product, 200)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Product Info & Price */}
            <div className="md:col-span-2 space-y-4">
              {/* Product Name - More Prominent */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                {product.category_name && (
                  <span className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {product.category_name}
                  </span>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Giá chưa VAT:</span>
                  <span className="text-gray-900 font-medium">
                    {formatCurrency(priceExcludingVAT)}₫
                  </span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      VAT ({(taxRate * 100).toFixed(0)}%):
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(vatAmount)}₫
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="text-base font-semibold text-gray-900">
                    Tổng tiền:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalPriceIncludingVAT)}₫
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-6">
            {/* Size Selector - Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Kích thước
              </label>
              <div className="flex gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      selectedSize === size.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector - Swatches */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Màu sắc
              </label>
              <div className="flex gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedColor === color.value
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className={`text-xs font-medium ${
                      selectedColor === color.value ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {color.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Input - With +/- Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Số lượng
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MinusOutlined className="text-gray-600" />
                </button>
                <InputNumber
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(value) => handleQuantityChange(value || 1)}
                  className="flex-1 text-center"
                  size="large"
                  controls={false}
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 99}
                  className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <PlusOutlined className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Total Price for Quantity */}
            {quantity > 1 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Tổng ({quantity} sản phẩm):
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalPriceForQuantity)}₫
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
