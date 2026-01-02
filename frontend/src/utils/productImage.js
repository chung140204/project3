// Utility function to get appropriate product image based on product name/category
// Maps product names to specific Unsplash images for better visual representation

/**
 * Get product image URL based on product name and category
 * @param {Object} product - Product object with name, category_name, and optional image
 * @param {number} size - Image size (default: 800, use 400 for thumbnails)
 * @returns {string} Image URL
 */
export const getProductImage = (product, size = 800) => {
  // If product has image from API, use it
  if (product?.image) {
    return product.image;
  }
  
  // Map product names to specific images
  const productName = product?.name?.toLowerCase() || '';
  
  // Áo khoác mùa đông - Winter Jacket (PHẢI kiểm tra TRƯỚC "áo thun nam" vì có thể chứa "áo" và "nam")
  if (productName.includes('áo khoác') && (productName.includes('mùa đông') || productName.includes('đông') || productName.includes('winter'))) {
    return `https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=${size}&h=${size}&fit=crop&q=80`; // Winter jacket - men's stylish winter coat
  }
  
  // Áo khoác - Jacket (general) - kiểm tra trước "áo thun" để tránh match sai
  if (productName.includes('áo khoác') || productName.includes('jacket')) {
    return `https://images.unsplash.com/photo-1551028719-00167b16eac5?w=${size}&h=${size}&fit=crop&q=80`; // Men's casual jacket - modern style
  }
  
  // Áo thun nam - Men's T-shirt (kiểm tra sau "áo khoác")
  if (productName.includes('áo thun') || (productName.includes('áo') && productName.includes('nam') && !productName.includes('khoác'))) {
    return `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=${size}&h=${size}&fit=crop`;
  }
  
  // Quần jean nữ - Women's Jeans
  if (productName.includes('quần jean') || (productName.includes('quần') && productName.includes('nữ'))) {
    return `https://images.unsplash.com/photo-1542272604-787c3835535d?w=${size}&h=${size}&fit=crop`;
  }
  
  // Nón lưỡi trai - Baseball Cap
  if (productName.includes('nón') || productName.includes('mũ')) {
    return `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=${size}&h=${size}&fit=crop`;
  }
  
  // Fallback based on category
  const categoryImages = {
    'Áo': `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=${size}&h=${size}&fit=crop`, // T-shirt
    'Quần': `https://images.unsplash.com/photo-1542272604-787c3835535d?w=${size}&h=${size}&fit=crop`, // Jeans
    'Phụ kiện': `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=${size}&h=${size}&fit=crop` // Cap
  };
  
  return categoryImages[product?.category_name] || `https://images.unsplash.com/photo-1445205170230-053b83016050?w=${size}&h=${size}&fit=crop`;
};

