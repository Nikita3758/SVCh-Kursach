export function formatPrice(price) {
  return Number(price || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Br';
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString) {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName, lastName) {
  const f = (firstName || '').charAt(0);
  const l = (lastName || '').charAt(0);
  return `${f}${l}`.toUpperCase() || '?';
}

export function formatOrderId(id) {
  return `#${String(id).padStart(6, '0')}`;
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'В ожидании',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  return labels[status] || status;
}
