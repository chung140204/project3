const ProductModel = require('../models/ProductModel');
const OrderModel = require('../models/OrderModel');
const OrderItemModel = require('../models/OrderItemModel');
const TaxService = require('./TaxService');

class OrderService {
  /**
   * Voucher validation and discount calculation
   * @param {string} voucherCode - Voucher code
   * @param {number} subtotal - Subtotal before VAT
   * @returns {Object} { valid: boolean, discount: number, type: string }
   */
  static validateVoucher(voucherCode, subtotal) {
    if (!voucherCode) {
      return { valid: false, discount: 0, type: null };
    }

    const code = voucherCode.toUpperCase().trim();
    const validVouchers = {
      'SALE10': { type: 'discount', rate: 0.10 },
      'FREESHIP': { type: 'freeship', rate: 0 }
    };

    const voucher = validVouchers[code];
    if (!voucher) {
      return { valid: false, discount: 0, type: null };
    }

    let discount = 0;
    if (voucher.type === 'discount') {
      discount = subtotal * voucher.rate;
    }
    // FREESHIP is UI only, no discount on subtotal

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      type: voucher.type
    };
  }

  /**
   * Create an order from cart items
   * IMPORTANT: All VAT calculations are done on backend - never trust frontend
   * @param {number} userId - User ID placing the order
   * @param {Array} items - Array of items with {productId, quantity, size, color}
   * @param {Object} customer - Customer information
   * @param {string} voucherCode - Optional voucher code
   * @returns {Promise<Object>} Created order with orderId
   */
  static async createOrder(userId, items, customer, voucherCode = null) {
    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Items cannot be empty');
    }

    if (!customer || !customer.name || !customer.email || !customer.address) {
      throw new Error('Customer information is required (name, email, address)');
    }

    // Fetch all products and calculate totals (NEVER trust frontend)
    const orderItemsData = [];
    let subtotal = 0;
    let totalVAT = 0;

    for (const item of items) {
      const { productId, quantity, size, color } = item;

      // Validate item
      if (!productId || !quantity || quantity <= 0) {
        throw new Error('Invalid item: productId and quantity are required');
      }

      // Fetch product with tax rate from database
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new Error(`Product with id ${productId} not found`);
      }

      // Get price and tax rate from database (NEVER trust frontend)
      const price = parseFloat(product.price);
      const taxRate = parseFloat(product.tax_rate || 0);

      // Calculate VAT and totals on backend
      const lineSubtotal = price * quantity;
      const taxAmount = TaxService.calculateTax(price, quantity, taxRate);
      const lineTotal = TaxService.calculateTotal(price, quantity, taxRate);

      // Store order item data
      orderItemsData.push({
        product_id: productId,
        quantity,
        price,
        tax_amount: taxAmount,
        total: lineTotal,
        size: size || null,
        color: color || null
      });

      // Accumulate totals
      subtotal += lineSubtotal;
      totalVAT += taxAmount;
    }

    // Round subtotal and VAT
    subtotal = Math.round(subtotal * 100) / 100;
    totalVAT = Math.round(totalVAT * 100) / 100;

    // Apply voucher discount (if any)
    const voucher = this.validateVoucher(voucherCode, subtotal);
    const voucherDiscount = voucher.valid ? voucher.discount : 0;
    const finalSubtotal = subtotal - voucherDiscount;

    // Calculate final total (subtotal - discount + VAT)
    const totalAmount = finalSubtotal + totalVAT;

    // Create order record with all customer info
    const order = await OrderModel.create({
      user_id: userId,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone || null,
      customer_address: customer.address,
      customer_type: customer.type || 'INDIVIDUAL',
      company_name: customer.companyName || null,
      tax_code: customer.taxCode || null,
      order_note: customer.note || null,
      voucher_code: voucher.valid ? voucherCode : null,
      voucher_discount: voucherDiscount,
      subtotal: subtotal,
      total_vat: totalVAT,
      total_amount: Math.round(totalAmount * 100) / 100,
      status: 'PENDING'
    });

    // Create order items records
    for (const itemData of orderItemsData) {
      await OrderItemModel.create({
        order_id: order.id,
        ...itemData
      });
    }

    // Return only orderId as specified
    return {
      orderId: order.id
    };
  }

  /**
   * Get order by ID with order items
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order with order items
   */
  static async getOrderById(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return null;
    }

    const orderItems = await OrderItemModel.findByOrderId(orderId);

    return {
      ...order,
      items: orderItems
    };
  }

  /**
   * Get invoice data for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Full invoice data
   */
  static async getInvoiceData(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return null;
    }

    const orderItems = await OrderItemModel.findByOrderId(orderId);

    // Format invoice items
    const items = orderItems.map(item => ({
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      vatRate: item.tax_amount / (item.price * item.quantity), // Calculate VAT rate
      vatAmount: parseFloat(item.tax_amount),
      total: parseFloat(item.total),
      size: item.size,
      color: item.color,
      image: item.product_image
    }));

    return {
      orderId: order.id,
      orderDate: order.order_date,
      status: order.status || 'PENDING',
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
        type: order.customer_type,
        companyName: order.company_name,
        taxCode: order.tax_code
      },
      items: items,
      summary: {
        subtotal: parseFloat(order.subtotal),
        voucherDiscount: parseFloat(order.voucher_discount || 0),
        finalSubtotal: parseFloat(order.subtotal) - parseFloat(order.voucher_discount || 0),
        totalVAT: parseFloat(order.total_vat),
        total: parseFloat(order.total_amount)
      },
      voucher: order.voucher_code ? {
        code: order.voucher_code,
        discount: parseFloat(order.voucher_discount),
        type: order.voucher_code === 'FREESHIP' ? 'freeship' : 'discount'
      } : null,
      note: order.order_note
    };
  }

  /**
   * Get all orders for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of orders with order items
   */
  static async getOrdersByUserId(userId) {
    const orders = await OrderModel.findByUserId(userId);
    
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItemModel.findByOrderId(order.id);
        return {
          ...order,
          items: orderItems
        };
      })
    );

    return ordersWithItems;
  }
}

module.exports = OrderService;

