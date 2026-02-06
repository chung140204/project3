/**
 * UC003 – Order Tracking (Customer). Labels for orders list & invoice.
 * Ready for i18n later.
 */

export const ORDER_TRACKING_LABELS = {
  pageTitle: 'Đơn hàng của tôi',
  pageSubtitle: 'Theo dõi đơn hàng và trạng thái giao hàng',
  orderId: 'Mã đơn',
  date: 'Ngày đặt',
  status: 'Trạng thái',
  totalAmount: 'Tổng tiền',
  viewInvoice: 'Xem hóa đơn',
  emptyTitle: 'Bạn chưa có đơn hàng nào',
  emptySubtext: 'Đơn hàng của bạn sẽ hiển thị tại đây sau khi đặt hàng',
  shopNow: 'Mua sắm ngay',
  loadError: 'Không thể tải lịch sử đơn hàng',
  forbidden: 'Bạn không có quyền xem đơn hàng này',
  backToOrders: 'Về đơn hàng của tôi',
};

/** Timeline steps for order progress (invoice page) */
export const ORDER_PROGRESS_STEPS = [
  { key: 'PENDING', label: 'Đặt hàng', description: 'Đơn hàng đã được tạo' },
  { key: 'PAID', label: 'Thanh toán', description: 'Đã thanh toán' },
  { key: 'COMPLETED', label: 'Hoàn thành', description: 'Giao hàng thành công' },
  { key: 'CANCELLED', label: 'Đã hủy', description: 'Đơn hàng đã hủy' },
];

/** UC005 – Return request status labels and badge color */
export const RETURN_STATUS_CONFIG = {
  NONE: { label: 'Không có yêu cầu', color: 'default' },
  REQUESTED: { label: 'Đang chờ duyệt', color: 'orange' },
  APPROVED: { label: 'Đã chấp nhận', color: 'green' },
  REJECTED: { label: 'Đã từ chối', color: 'red' },
};
