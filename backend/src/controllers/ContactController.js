const EmailService = require('../services/EmailService');

class ContactController {
  /**
   * POST /api/contact
   * Body: { name, email, phone, subject, message }
   * Public endpoint
   */
  static async sendContactMessage(req, res) {
    try {
      const accountEmail = (req.user?.email || '').trim().toLowerCase();
      if (!accountEmail) {
        return res.status(401).json({
          success: false,
          error: 'Vui lòng đăng nhập để gửi liên hệ'
        });
      }

      const name = (req.body?.name || '').trim();
      const phone = (req.body?.phone || '').trim();
      const subject = (req.body?.subject || '').trim();
      const content = (req.body?.message || '').trim();

      if (!name || !phone || !subject || !content) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        });
      }

      const result = await EmailService.sendContactMessage({
        name,
        email: accountEmail,
        phone,
        subject,
        message: content
      });

      if (result?.skipped) {
        return res.status(500).json({
          success: false,
          error: 'Chưa cấu hình email hệ thống (SMTP). Vui lòng cấu hình SMTP để gửi liên hệ.'
        });
      }

      if (!result?.success) {
        return res.status(500).json({
          success: false,
          error: result?.error || 'Gửi liên hệ thất bại. Vui lòng thử lại sau.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Gửi tin nhắn thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.'
      });
    } catch (err) {
      console.error('sendContactMessage error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Gửi liên hệ thất bại. Vui lòng thử lại sau.'
      });
    }
  }
}

module.exports = ContactController;

