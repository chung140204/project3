// Contact page
// Contact information and contact form

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Form, Input, Button, message, Select } from 'antd';
import MainLayout from '../layouts/MainLayout';

export default function ContactPage() {
  const [form] = Form.useForm();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjectOptions = [
    { value: 'vat_inquiry', label: 'VAT inquiry' },
    { value: 'invoice_tax', label: 'Invoice & tax' },
    { value: 'order_support', label: 'Order support' },
    { value: 'payment_issue', label: 'Payment issue' },
    { value: 'other', label: 'Other' }
  ];

  const onFinish = (values) => {
    console.log('Contact form values:', values);
    message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    form.resetFields();
    setSelectedSubject(null); // Reset subject state
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
  };

  return (
    <MainLayout>
      <motion.div
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-gray-600">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin liên hệ
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📧</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">support@fashionstore.com</p>
                      <p className="text-gray-600">info@fashionstore.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📞</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                      <p className="text-gray-600">Hotline: 1900 1234</p>
                      <p className="text-gray-600">Mobile: 0901 234 567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📍</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                      <p className="text-gray-600">
                        123 Đường ABC, Phường XYZ<br />
                        Quận 1, TP. Hồ Chí Minh<br />
                        Việt Nam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🕒</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                      <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                      <p className="text-gray-600">Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Hỗ trợ khách hàng
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Hỗ trợ 24/7 qua email</li>
                  <li>✓ Tư vấn về sản phẩm và VAT</li>
                  <li>✓ Giải đáp thắc mắc về đơn hàng</li>
                  <li>✓ Hỗ trợ kỹ thuật và thanh toán</li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gửi tin nhắn
              </h2>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
              >
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' }
                  ]}
                >
                  <Input size="large" placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input size="large" placeholder="example@email.com" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' }
                  ]}
                >
                  <Input size="large" placeholder="0901 234 567" />
                </Form.Item>

                <Form.Item
                  label="Chủ đề"
                  name="subject"
                  rules={[
                    { required: true, message: 'Vui lòng chọn chủ đề' }
                  ]}
                >
                  <Select
                    size="large"
                    placeholder="Chọn chủ đề"
                    options={subjectOptions}
                    onChange={(value) => {
                      setSelectedSubject(value);
                      // Reset "other_subject" field nếu chọn chủ đề khác
                      if (value !== 'other') {
                        form.setFieldsValue({ other_subject: undefined });
                      }
                    }}
                  />
                </Form.Item>

                {/* Hiển thị input khi chọn "Other" */}
                {selectedSubject === 'other' && (
                  <Form.Item
                    label="Chủ đề khác"
                    name="other_subject"
                    rules={[
                      { required: true, message: 'Vui lòng nhập chủ đề bạn muốn liên hệ' }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Nhập chủ đề bạn muốn liên hệ"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label="Nội dung"
                  name="message"
                  rules={[
                    { required: true, message: 'Vui lòng nhập nội dung' }
                  ]}
                >
                  <Input.TextArea
                    rows={6}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    className="h-12 text-base font-semibold"
                  >
                    Gửi tin nhắn
                  </Button>
                </Form.Item>
              </Form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

