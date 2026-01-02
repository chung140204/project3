// Floating cart icon with mini cart drawer
// Provides quick access to cart from any page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Drawer, Button, Badge, InputNumber } from 'antd';
import { useCart } from '../../hooks/useCart';
import { getProductImage } from '../../utils/productImage';

export default function FloatingCart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, totals, itemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle view cart button
  const handleViewCart = () => {
    setDrawerOpen(false);
    navigate('/cart');
  };

  // Handle checkout button
  const handleCheckout = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={itemCount} showZero={false} offset={[-5, 5]}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Giỏ hàng"
          >
            <ShoppingCartOutlined className="text-2xl" />
          </button>
        </Badge>
      </div>

      {/* Mini Cart Drawer */}
      <Drawer
        title="Giỏ hàng của bạn"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={400}
        className="cart-drawer"
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCartOutlined className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Giỏ hàng của bạn đang trống</p>
            <Button type="primary" onClick={() => { setDrawerOpen(false); navigate('/products'); }}>
              Xem sản phẩm
            </Button>
          </div>
        ) : (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ minHeight: 0 }}>
              {cartItems.map((item) => {
                const product = {
                  id: item.product_id,
                  name: item.product_name,
                  image: item.product_image,
                  category_name: null
                };
                
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product_image || getProductImage(product, 80)}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.product_name}
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

                      {/* Quantity Control */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Số lượng:</span>
                          <InputNumber
                            min={1}
                            max={99}
                            value={item.quantity}
                            onChange={(value) => handleQuantityChange(item.id, value || 1)}
                            size="small"
                            className="w-16"
                          />
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Xóa
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="mt-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.total)}₫
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          (đã bao gồm VAT)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              {/* Summary Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng số sản phẩm:</span>
                  <span className="font-semibold text-gray-900">{itemCount} sản phẩm</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-medium">Tổng tiền:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(totals.grandTotal)}₫
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  (đã bao gồm VAT)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  type="default"
                  block
                  size="large"
                  onClick={handleViewCart}
                  className="h-11"
                >
                  Xem giỏ hàng
                </Button>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleCheckout}
                  className="h-11 font-semibold"
                >
                  Thanh toán
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

