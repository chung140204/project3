// Shopping cart page
// Displays cart items, quantities, and VAT calculations

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, Table, InputNumber } from 'antd';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../hooks/useCart';
import { calculateCartTotals } from '../context/CartContext';
import { getProductImage } from '../utils/productImage';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const totals = calculateCartTotals(cartItems);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Calculate item totals dynamically
  const getItemTotals = (item) => {
    const subtotal = item.price * item.quantity;
    const vatAmount = subtotal * item.vatRate;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  // Table columns for cart items
  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        const product = {
          id: record.productId || record.id,
          name: record.name,
          image: record.image,
          category_name: null
        };
        return (
          <div className="flex items-center gap-4">
            <img
              src={record.image || getProductImage(product, 100)}
              alt={record.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <div className="font-medium">{record.name}</div>
              {(record.size || record.color) && (
                <div className="text-sm text-gray-500">
                  {record.size && `Kích thước: ${record.size}`}
                  {record.size && record.color && ' • '}
                  {record.color && `Màu: ${record.color}`}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Giá (chưa VAT)',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => (
        <span>{formatCurrency(price)}₫</span>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={99}
          value={record.quantity}
          onChange={(value) => updateQuantity(record.id, value || 1)}
        />
      ),
    },
    {
      title: 'VAT',
      key: 'vat',
      align: 'right',
      render: (_, record) => {
        const itemTotals = getItemTotals(record);
        return (
          <div className="text-right">
            <div className="text-gray-600 text-sm">
              {(record.vatRate * 100).toFixed(0)}%
            </div>
            <div className="text-gray-900 font-medium">
              {formatCurrency(itemTotals.vatAmount)}₫
            </div>
          </div>
        );
      },
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => {
        const itemTotals = getItemTotals(record);
        return (
          <span className="font-semibold text-gray-900">
            {formatCurrency(itemTotals.total)}₫
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => removeFromCart(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <motion.div
          className="py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Link to="/products">
              <Button type="primary" size="large">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </motion.div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Giỏ hàng
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <Table
                  columns={columns}
                  dataSource={cartItems}
                  pagination={false}
                  rowKey="id"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Tóm tắt đơn hàng
                </h2>

                {/* VAT Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tạm tính (chưa VAT):</span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(totals.subtotal)}₫
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-gray-200 pt-4 text-sm">
                    <span className="text-gray-600">Tổng VAT:</span>
                    <span className="text-gray-800 font-medium">
                      {formatCurrency(totals.totalVAT)}₫
                    </span>
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Tổng cộng:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totals.total)}₫
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      (đã bao gồm VAT)
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link to="/checkout">
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="h-12 text-base font-semibold"
                  >
                    Thanh toán
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
