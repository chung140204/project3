// Global cart state management using React Context
// Manages cart items, totals, and VAT calculations with localStorage persistence

import { createContext, useState, useContext, useCallback, useEffect } from 'react';

const CartContext = createContext();
const CART_STORAGE_KEY = 'fashion_store_cart';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Calculate cart totals utility function
export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const totalVAT = cartItems.reduce((sum, item) => {
    const vatAmount = item.price * item.quantity * item.vatRate;
    return sum + vatAmount;
  }, 0);

  const total = subtotal + totalVAT;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalVAT: Math.round(totalVAT * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: itemCount
  };
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage());

  // Save to localStorage whenever cartItems change
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  // Add item to cart
  const addItem = useCallback((product, options = {}) => {
    const { size = null, color = null, quantity = 1 } = options;
    
    setCartItems(prevItems => {
      // Check if item already exists with same product, size, and color
      const existingItemIndex = prevItems.findIndex(
        item => 
          (item.productId || item.id) === product.id && 
          item.size === size && 
          item.color === color
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item (DO NOT store total price - calculate dynamically)
        // Create unique ID combining product ID, size, and color (stable, no timestamp)
        const uniqueId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`;
        
        const newItem = {
          id: uniqueId,
          productId: product.id, // Keep product ID for reference
          name: product.name,
          image: product.image || null,
          price: parseFloat(product.price) || 0,
          vatRate: parseFloat(product.tax_rate || 0),
          size: size,
          color: color,
          quantity: quantity
        };

        return [...prevItems, newItem];
      }
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: newQuantity
          };
        }
        return item;
      });
    });
  }, [removeItem]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calculate totals dynamically
  const totals = calculateCartTotals(cartItems);

  // Legacy support: addToCart alias for addItem
  const addToCart = addItem;
  const removeFromCart = removeItem;

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    // Legacy support
    addToCart,
    removeFromCart,
    // Calculated values
    totals,
    itemCount: totals.itemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export default CartProvider;
