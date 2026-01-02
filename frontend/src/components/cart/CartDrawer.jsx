// Cart Drawer Component
// Displays cart items with VAT breakdown and controls

import { Drawer, Button, InputNumber } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCart } from '../../hooks/useCart';
import { calculateCartTotals } from '../../context/CartContext';
import { getProductImage } from '../../utils/productImage';

export default function CartDrawer({ open, onClose }) {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const totals = calculateCartTotals(cartItems);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  // Format color name
  const formatColor = (color) => {
    const colorMap = {
      'black': 'Đen',
      'white': 'Trắng',
      'blue': 'Xanh dương',
      'red': 'Đỏ',
      'green': 'Xanh lá',
      'yellow': 'Vàng'
    };
    return colorMap[color?.toLowerCase()] || color;
  };

  // Calculate item totals dynamically
  const getItemTotals = (item) => {
    const subtotal = item.price * item.quantity;
    const vatAmount = subtotal * item.vatRate;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ShoppingCartOutlined className="text-xl" />
          <span className="text-lg font-semibold">Giỏ hàng của bạn</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={450}
      styles={{
        body: {
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }
      }}
    >
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
          <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Giỏ hàng của bạn đang trống</p>
          <Button type="primary" onClick={onClose}>
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ minHeight: 0 }}>
            {cartItems.map((item) => {
              const itemTotals = getItemTotals(item);
              const product = {
                id: item.productId || item.id,
                name: item.name,
                image: item.image,
                category_name: null
              };

              return (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || getProductImage(product, 80)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.name}
                    </h4>
                    
                    {/* Size and Color */}
                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                      {item.size && (
                        <div>Kích thước: <span className="font-medium">{item.size}</span></div>
                      )}
                      {item.color && (
                        <div>Màu sắc: <span className="font-medium">{formatColor(item.color)}</span></div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="mb-3 space-y-1">
                      <div className="text-xs text-gray-500">
                        Giá: {formatCurrency(item.price)}₫ × {item.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        VAT ({item.vatRate * 100}%): {formatCurrency(itemTotals.vatAmount)}₫
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        Tổng: {formatCurrency(itemTotals.total)}₫
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Số lượng:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <MinusOutlined className="text-xs" />
                          </button>
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => updateQuantity(item.id, value || 1)}
                            size="small"
                            className="w-12 text-center"
                            controls={false}
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            <PlusOutlined className="text-xs" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                      >
                        <DeleteOutlined />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Footer */}
          <div className="border-t border-gray-200 pt-4 space-y-4 bg-white">
            {/* Summary Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng số sản phẩm:</span>
                <span className="font-semibold text-gray-900">{totals.itemCount} sản phẩm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng tiền (chưa VAT):</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.subtotal)}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng VAT:</span>
                <span className="font-medium text-gray-900">{formatCurrency(totals.totalVAT)}₫</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-300">
                <span className="text-gray-900 font-semibold">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(totals.total)}₫
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                type="default"
                block
                size="large"
                onClick={onClose}
                className="h-11"
              >
                Tiếp tục mua sắm
              </Button>
              <Button
                type="primary"
                block
                size="large"
                className="h-11 font-semibold"
                onClick={() => {
                  onClose();
                  window.location.href = '/checkout';
                }}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

