// Custom hook for cart operations
// Provides easy access to cart context and operations

import { useCart as useCartContext } from '../context/CartContext';

export function useCart() {
  return useCartContext();
}

export default useCart;
