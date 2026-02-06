const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const OrderModel = require('../models/OrderModel');
const OrderItemModel = require('../models/OrderItemModel');
const OrderReturnRequestModel = require('../models/OrderReturnRequestModel');
const ProductModel = require('../models/ProductModel');

/**
 * UC005: Convert multer files to relative paths for storage in DB
 * Multer diskStorage saves files to disk and sets file.path
 * @param {Array|Object} files - Multer file object(s) from diskStorage
 * @returns {Array<string>} Array of relative paths (e.g. "uploads/returns/filename.jpg")
 */
function saveReturnMediaFiles(files) {
  const paths = [];
  const fileList = Array.isArray(files) ? files : (files ? [files] : []);

  for (const file of fileList) {
    if (!file) continue;
    // Multer diskStorage: file.path is absolute path to saved file
    if (file.path) {
      try {
        const relPath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');
        if (relPath && !relPath.startsWith('..')) {
          paths.push(relPath);
        } else {
          // Fallback: use basename if relative path fails
          paths.push(path.join('uploads', 'returns', path.basename(file.path)).replace(/\\/g, '/'));
        }
      } catch (_) {
        paths.push(path.join('uploads', 'returns', path.basename(file.path)).replace(/\\/g, '/'));
      }
    } else if (file.buffer) {
      // Fallback: if buffer exists (shouldn't happen with diskStorage, but handle it)
      const ext = path.extname(file.originalname || '') || '.jpg';
      const filename = `return_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'returns');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      paths.push(path.join('uploads', 'returns', filename).replace(/\\/g, '/'));
    }
  }

  return paths;
}

class OrderReturnService {
  /**
   * Submit return request (customer)
   * Conditions: status=COMPLETED, return_status=NONE, within 7 days of completed_at
   * @param {number} orderId
   * @param {number} userId
   * @param {string} reason
   * @param {Array|Object} files - Multer file(s) for upload
   * @returns {Promise<Object>}
   */
  static async submitReturnRequest(orderId, userId, reason, files = null) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.user_id !== userId) {
      throw new Error('You can only submit return request for your own orders');
    }

    if (order.status !== 'COMPLETED') {
      throw new Error('Return request is only allowed for completed orders');
    }

    if (order.return_status !== 'NONE') {
      throw new Error('Return request already exists or was processed');
    }

    // Dùng completed_at nếu có, không thì fallback order_date (đơn cũ có thể chưa có completed_at)
    const completedAt = order.completed_at
      ? new Date(order.completed_at)
      : order.order_date
        ? new Date(order.order_date)
        : null;
    if (!completedAt) {
      throw new Error('Order completed_at is missing');
    }

    const deadline = new Date(completedAt);
    deadline.setDate(deadline.getDate() + 7);
    if (new Date() > deadline) {
      throw new Error('Return request must be submitted within 7 days of order completion');
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error('Reason is required');
    }

    const mediaPaths = saveReturnMediaFiles(files);
    const mediaUrls = mediaPaths.length > 0 ? mediaPaths : null;

    const returnRequest = await OrderReturnRequestModel.create({
      order_id: orderId,
      user_id: userId,
      reason: reason.trim(),
      media_urls: mediaUrls
    });

    await OrderModel.updateReturnStatus(orderId, 'REQUESTED');

    return {
      returnRequestId: returnRequest.id,
      orderId,
      message: 'Return request submitted successfully'
    };
  }

  /**
   * Admin approve return request
   * Transaction: update return_status, refunded_at, restore stock
   * @param {number} orderId
   * @returns {Promise<Object>}
   */
  static async approveReturnRequest(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.return_status !== 'REQUESTED') {
      throw new Error('Order return status must be REQUESTED to approve');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // UC008: Set return_status=APPROVED, refunded_at=NOW(), status=CANCELLED (order treated as refunded)
      await OrderModel.updateReturnStatus(orderId, 'APPROVED', {
        refunded_at: true,
        setOrderCancelled: true,
        conn: connection
      });

      const orderItems = await OrderItemModel.findByOrderId(orderId, connection);
      for (const item of orderItems) {
        const incremented = await ProductModel.incrementStock(
          item.product_id,
          item.quantity,
          connection
        );
        if (!incremented) {
          throw new Error(`Failed to restore stock for product ${item.product_id}`);
        }
      }

      await connection.commit();

      return {
        orderId,
        message: 'Return request approved. Stock restored and refunded_at set.'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Admin reject return request
   * @param {number} orderId
   * @returns {Promise<Object>}
   */
  static async rejectReturnRequest(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.return_status !== 'REQUESTED') {
      throw new Error('Order return status must be REQUESTED to reject');
    }

    await OrderModel.updateReturnStatus(orderId, 'REJECTED');

    return {
      orderId,
      message: 'Return request rejected'
    };
  }
}

module.exports = {
  OrderReturnService,
  saveReturnMediaFiles
};
