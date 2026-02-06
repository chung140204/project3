const nodemailer = require('nodemailer');
const path = require('path');
// Load .env from project root (backend folder)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Email Service for sending order notifications
 */
class EmailService {
  /**
   * Create nodemailer transporter
   * Uses SMTP config from environment variables
   */
  static createTransporter() {
    // For development: use Gmail SMTP or other SMTP service
    // For production: configure with your email service provider
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    return transporter;
  }

  /**
   * Send order confirmation email to customer
   * @param {Object} orderData - Order data including customer info and items
   * @returns {Promise<Object>} Email send result
   */
  static async sendOrderConfirmation(orderData) {
    try {
      // Validate email config
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('⚠️  SMTP credentials not configured. Skipping email send.');
        console.warn('   Make sure .env file has SMTP_USER and SMTP_PASSWORD set.');
        console.warn('   Restart server after changing .env file.');
        return { success: false, skipped: true, message: 'SMTP not configured' };
      }

      const transporter = this.createTransporter();

      const { customer, orderId, orderDate, items, summary, voucher } = orderData;

      // Format order date
      const formattedDate = new Date(orderDate).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Build items HTML
      let itemsHtml = '';
      items.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity * (1 + item.vatRate)).toFixed(2);
        itemsHtml += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${index + 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${(item.vatRate * 100).toFixed(0)}%</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${parseFloat(itemTotal).toLocaleString('vi-VN')} đ</td>
          </tr>
        `;
      });

      // Email HTML template
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác nhận đơn hàng #${orderId}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Đặt hàng thành công!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Xin chào <strong>${customer.name}</strong>,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Thông tin đơn hàng</h2>
              <table style="width: 100%; margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Mã đơn hàng:</strong></td>
                  <td style="padding: 8px 0; text-align: right;"><strong style="color: #667eea;">#${orderId}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Ngày đặt:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Trạng thái:</strong></td>
                  <td style="padding: 8px 0; text-align: right;"><span style="background: #ffa500; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">Đang xử lý</span></td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Chi tiết sản phẩm</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">STT</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">VAT</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Tổng thanh toán</h2>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tạm tính:</td>
                  <td style="padding: 8px 0; text-align: right;">${summary.subtotal.toLocaleString('vi-VN')} đ</td>
                </tr>
                ${voucher && voucher.discount > 0 ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Giảm giá (${voucher.code}):</td>
                  <td style="padding: 8px 0; text-align: right; color: #e74c3c;">-${voucher.discount.toLocaleString('vi-VN')} đ</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tạm tính sau giảm giá:</td>
                  <td style="padding: 8px 0; text-align: right;">${summary.finalSubtotal.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">VAT:</td>
                  <td style="padding: 8px 0; text-align: right;">${summary.totalVAT.toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #667eea;">Tổng cộng:</td>
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #667eea; text-align: right;">${summary.total.toLocaleString('vi-VN')} đ</td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Thông tin giao hàng</h2>
              <p style="margin: 8px 0;"><strong>Người nhận:</strong> ${customer.name}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${customer.email}</p>
              ${customer.phone ? `<p style="margin: 8px 0;"><strong>Điện thoại:</strong> ${customer.phone}</p>` : ''}
              <p style="margin: 8px 0;"><strong>Địa chỉ:</strong> ${customer.address}</p>
            </div>

            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p style="margin: 0; color: #555;">
                <strong>Lưu ý:</strong> Chúng tôi sẽ gửi email cập nhật khi đơn hàng của bạn được xác nhận và vận chuyển. 
                Bạn có thể theo dõi trạng thái đơn hàng tại trang "Đơn hàng & Hóa đơn" trong tài khoản của mình.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!<br>
                Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Plain text version
      const text = `
Xác nhận đơn hàng #${orderId}

Xin chào ${customer.name},

Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!

THÔNG TIN ĐƠN HÀNG:
- Mã đơn hàng: #${orderId}
- Ngày đặt: ${formattedDate}
- Trạng thái: Đang xử lý

CHI TIẾT SẢN PHẨM:
${items.map((item, index) => `${index + 1}. ${item.name}${item.size ? ` (Size: ${item.size})` : ''}${item.color ? ` - ${item.color}` : ''} - SL: ${item.quantity} - Giá: ${item.price.toLocaleString('vi-VN')} đ - VAT: ${(item.vatRate * 100).toFixed(0)}%`).join('\n')}

TỔNG THANH TOÁN:
- Tạm tính: ${summary.subtotal.toLocaleString('vi-VN')} đ
${voucher && voucher.discount > 0 ? `- Giảm giá (${voucher.code}): -${voucher.discount.toLocaleString('vi-VN')} đ\n` : ''}- Tạm tính sau giảm giá: ${summary.finalSubtotal.toLocaleString('vi-VN')} đ
- VAT: ${summary.totalVAT.toLocaleString('vi-VN')} đ
- Tổng cộng: ${summary.total.toLocaleString('vi-VN')} đ

THÔNG TIN GIAO HÀNG:
- Người nhận: ${customer.name}
- Email: ${customer.email}
${customer.phone ? `- Điện thoại: ${customer.phone}\n` : ''}- Địa chỉ: ${customer.address}

Chúng tôi sẽ gửi email cập nhật khi đơn hàng của bạn được xác nhận và vận chuyển.

Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!
      `;

      const mailOptions = {
        from: `"Fashion Store" <${process.env.SMTP_USER}>`,
        to: customer.email,
        subject: `Xác nhận đơn hàng #${orderId} - Fashion Store`,
        text: text,
        html: html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent:', info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      // Don't throw - email failure shouldn't break order creation
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  /**
   * Send contact form message to support mailbox
   * @param {Object} payload
   * @param {string} payload.name
   * @param {string} payload.email
   * @param {string} payload.phone
   * @param {string} payload.subject
   * @param {string} payload.message
   */
  static async sendContactMessage(payload) {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn('⚠️  SMTP credentials not configured. Skipping email send.');
        return { success: false, skipped: true, message: 'SMTP not configured' };
      }

      const toEmail = (process.env.SUPPORT_EMAIL || process.env.SMTP_USER || '').trim();
      if (!toEmail) {
        return { success: false, error: 'SUPPORT_EMAIL is not configured' };
      }

      const transporter = this.createTransporter();

      const customerEmail = payload.email || '(không cung cấp)';
      const subject = `[Liên hệ] ${payload.subject} - ${payload.name}`;
      const text = `Bạn nhận được tin nhắn liên hệ mới:\n\nHọ tên: ${payload.name}\nEmail: ${customerEmail}\nSĐT: ${payload.phone}\nChủ đề: ${payload.subject}\n\nNội dung:\n${payload.message}\n`;

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="margin: 0 0 12px;">Tin nhắn liên hệ mới</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 700px;">
            <tr><td style="padding: 6px 0; width: 140px;"><strong>Họ tên</strong></td><td style="padding: 6px 0;">${payload.name}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Email</strong></td><td style="padding: 6px 0;">${customerEmail}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>SĐT</strong></td><td style="padding: 6px 0;">${payload.phone}</td></tr>
            <tr><td style="padding: 6px 0;"><strong>Chủ đề</strong></td><td style="padding: 6px 0;">${payload.subject}</td></tr>
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="margin: 0 0 6px;"><strong>Nội dung</strong></p>
          <div style="white-space: pre-wrap; background: #fafafa; padding: 12px; border-radius: 8px; border: 1px solid #eee;">${payload.message}</div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"Fashion Store - Contact" <${process.env.SMTP_USER}>`,
        to: toEmail,
        ...(payload.email ? { replyTo: payload.email } : {}), // reply goes to customer if provided
        subject,
        text,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending contact email:', error);
      return { success: false, error: error.message || 'Failed to send contact email' };
    }
  }
}

module.exports = EmailService;
