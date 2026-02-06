/**
 * Shared formatters (admin + other pages).
 * Numbers use tabular-nums for alignment.
 */

export function formatOrderId(id) {
  return `#ORD-${String(id).padStart(4, '0')}`;
}

export function formatDateDDMMYYYY(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatVND(amount) {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
