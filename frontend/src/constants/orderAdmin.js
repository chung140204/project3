/**
 * Order Admin – constants for UI (colors, labels).
 * Structured for i18n: replace values with t('key') later.
 */

export const ORDER_THEME = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
};

export const ORDER_STATUS_CONFIG = {
  PENDING: {
    color: ORDER_THEME.warning,
    label: 'Chờ xử lý',
    tagColor: 'gold',
  },
  PAID: {
    color: ORDER_THEME.primary,
    label: 'Đã thanh toán',
    tagColor: 'blue',
  },
  COMPLETED: {
    color: ORDER_THEME.success,
    label: 'Hoàn thành',
    tagColor: 'green',
  },
  CANCELLED: {
    color: ORDER_THEME.danger,
    label: 'Đã hủy',
    tagColor: 'red',
  },
};

export const ORDER_LIST_LABELS = {
  cardTitle: 'Danh sách đơn hàng',
  orderId: 'Mã đơn hàng',
  customer: 'Khách hàng',
  orderDate: 'Ngày đặt',
  subtotal: 'Giá trị đơn',
  vat: 'VAT',
  total: 'Tổng tiền',
  status: 'Trạng thái',
  actions: 'Thao tác',
  updateStatus: 'Cập nhật trạng thái',
  viewDetail: 'Xem chi tiết',
  filterStatus: 'Tất cả trạng thái',
  filterDateRange: 'Khoảng thời gian',
};

export const ORDER_EMPTY_STATE = {
  title: 'Chưa có đơn hàng nào',
  subtext: 'Đơn hàng sẽ xuất hiện khi khách mua hàng',
};

export const ORDER_MESSAGES = {
  statusUpdateSuccess: 'Cập nhật trạng thái đơn hàng thành công',
  statusUpdateError: 'Không thể chuyển trạng thái này',
  loadError: 'Không thể tải dữ liệu đơn hàng',
  noMatchFilter: 'Không có đơn hàng nào phù hợp với bộ lọc',
};

export const ORDER_FILTER_OPTIONS = {
  statusAll: 'Tất cả trạng thái',
  dateRangePlaceholder: ['Từ ngày', 'Đến ngày'],
};
