const pool = require('../config/database');
const ProductModel = require('../models/ProductModel');
const OrderModel = require('../models/OrderModel');
const OrderItemModel = require('../models/OrderItemModel');
const EmailService = require('./EmailService');

/**
 * Round to 2 decimal places
 */
const round2 = (n) => Math.round(n * 100) / 100;

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
      discount: round2(discount),
      type: voucher.type
    };
  }

  /**
   * Create an order from cart items
   * IMPORTANT: All VAT calculations are done on backend - never trust frontend
   * Calculation order: subtotal -> voucher -> finalSubtotal -> VAT per item -> total
   * Uses transaction and stock validation
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

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Step 1: Fetch all products and build line items (NEVER trust frontend)
      const lineItems = [];
      let subtotal = 0;

      for (const item of items) {
        const { productId, quantity, size, color } = item;

        if (!productId || !quantity || quantity <= 0) {
          throw new Error('Invalid item: productId and quantity are required');
        }

        const product = await ProductModel.findById(productId, connection);
        if (!product) {
          throw new Error(`Product with id ${productId} not found`);
        }

        // Check stock
        const currentStock = parseInt(product.stock || 0);
        if (currentStock < quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${currentStock}, requested: ${quantity}`
          );
        }

        const price = parseFloat(product.price);
        const taxRate = parseFloat(product.tax_rate || 0);
        const lineSubtotal = price * quantity;

        lineItems.push({
          product_id: productId,
          quantity,
          price,
          tax_rate: taxRate,
          line_subtotal: lineSubtotal,
          size: size || null,
          color: color || null
        });

        subtotal += lineSubtotal;
      }

      subtotal = round2(subtotal);

      // Step 2: Apply voucher on subtotal (before VAT)
      const voucher = this.validateVoucher(voucherCode, subtotal);
      const voucherDiscount = voucher.valid ? voucher.discount : 0;
      const finalSubtotal = round2(subtotal - voucherDiscount);

      // Step 3: Calculate VAT per item based on finalSubtotal (proportional distribution)
      // effective_subtotal = line_subtotal * (finalSubtotal / subtotal)
      // tax_amount = effective_subtotal * tax_rate (rounded 2 decimals)
      // total = effective_subtotal + tax_amount (rounded 2 decimals)
      const proportion = subtotal > 0 ? finalSubtotal / subtotal : 1;
      let totalVAT = 0;
      const orderItemsData = [];

      for (const line of lineItems) {
        const effectiveSubtotal = round2(line.line_subtotal * proportion);
        const taxAmount = round2(effectiveSubtotal * line.tax_rate);
        const total = round2(effectiveSubtotal + taxAmount);

        orderItemsData.push({
          product_id: line.product_id,
          quantity: line.quantity,
          price: line.price,
          vat_rate: line.tax_rate,
          tax_amount: taxAmount,
          total,
          size: line.size,
          color: line.color
        });

        totalVAT += taxAmount;
      }

      totalVAT = round2(totalVAT);
      const totalAmount = round2(finalSubtotal + totalVAT);

      // Step 4: Create order record
      const order = await OrderModel.create(
        {
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
          subtotal,
          total_vat: totalVAT,
          total_amount: totalAmount,
          status: 'PENDING'
        },
        connection
      );

      // Step 5: Create order items and decrement stock
      for (const itemData of orderItemsData) {
        await OrderItemModel.create(
          {
            order_id: order.id,
            ...itemData
          },
          connection
        );

        const decremented = await ProductModel.decrementStock(
          itemData.product_id,
          itemData.quantity,
          connection
        );
        if (!decremented) {
          throw new Error(
            `Failed to decrement stock for product ${itemData.product_id}`
          );
        }
      }

      await connection.commit();

      // Send order confirmation email (non-blocking - don't fail order if email fails)
      try {
        // Fetch order items with product details for email
        const orderItems = await OrderItemModel.findByOrderId(order.id);
        
        // Format items for email
        const emailItems = orderItems.map(item => ({
          name: item.product_name || 'Sản phẩm',
          quantity: item.quantity,
          price: parseFloat(item.price),
          vatRate: parseFloat(item.vat_rate || 0),
          size: item.size,
          color: item.color
        }));

        // Prepare email data
        const emailData = {
          orderId: order.id,
          orderDate: order.order_date,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address
          },
          items: emailItems,
          summary: {
            subtotal: subtotal, // Original subtotal before discount
            finalSubtotal: finalSubtotal,
            totalVAT: totalVAT,
            total: totalAmount
          },
          voucher: voucher.valid && voucherDiscount > 0 ? {
            code: voucherCode,
            discount: voucherDiscount,
            type: voucher.type
          } : null
        };

        // Send email asynchronously (don't await - non-blocking)
        EmailService.sendOrderConfirmation(emailData).catch(err => {
          console.error('Failed to send order confirmation email:', err);
        });
      } catch (emailError) {
        // Log but don't fail order creation
        console.error('Error preparing order confirmation email:', emailError);
      }

      return {
        orderId: order.id
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
   * Uses snapshot data from order_items (vat_rate, tax_amount, total) - no recalculation
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Full invoice data
   */
  static async getInvoiceData(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return null;
    }

    const orderItems = await OrderItemModel.findByOrderId(orderId);

    // Format invoice items - use snapshot data from order_items
    const items = orderItems.map(item => ({
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      vatRate: parseFloat(item.vat_rate ?? 0),
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
      returnStatus: order.return_status || 'NONE',
      completedAt: order.completed_at || null,
      refundedAt: order.refunded_at || null,
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
