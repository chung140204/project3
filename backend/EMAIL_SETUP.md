# Hướng dẫn cấu hình Email thông báo đơn hàng

## Tổng quan

Hệ thống tự động gửi email xác nhận đơn hàng cho khách hàng sau khi đặt hàng thành công.

## Cấu hình SMTP

### 1. Cấu hình Gmail (Khuyến nghị cho development)

1. **Bật xác thực 2 bước** trên tài khoản Gmail của bạn:
   - Truy cập: https://myaccount.google.com/security
   - Bật "Xác minh 2 bước"

2. **Tạo App Password**:
   - Truy cập: https://myaccount.google.com/apppasswords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "Fashion Store Backend"
   - Copy mật khẩu được tạo (16 ký tự)

3. **Cập nhật file `.env`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### 2. Cấu hình SMTP khác (Outlook, SendGrid, Mailgun, etc.)

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

## Lưu ý

- **Development**: Nếu không cấu hình SMTP, hệ thống vẫn hoạt động bình thường nhưng sẽ không gửi email (có cảnh báo trong console).
- **Production**: Nên sử dụng dịch vụ email chuyên nghiệp như SendGrid, Mailgun, hoặc AWS SES để đảm bảo deliverability.
- Email được gửi **không đồng bộ** (non-blocking) - nếu email fail, đơn hàng vẫn được tạo thành công.

## Kiểm tra

Sau khi cấu hình, đặt một đơn hàng test và kiểm tra:
1. Console log: `✅ Order confirmation email sent: <messageId>`
2. Hộp thư đến của khách hàng (email trong thông tin đặt hàng)

## Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra lại `SMTP_USER` và `SMTP_PASSWORD`
- Với Gmail: Đảm bảo đã dùng App Password, không phải mật khẩu thường

### Lỗi "Connection timeout"
- Kiểm tra firewall/antivirus có chặn port 587/465 không
- Thử đổi `SMTP_PORT` sang 465 và `SMTP_SECURE=true`

### Email không đến
- Kiểm tra spam/junk folder
- Kiểm tra console log để xem có lỗi gửi email không
- Đảm bảo email khách hàng nhập đúng định dạng
