const STATUS_CONFIG = {
  pending: { label: 'В ожидании', color: '#7c5c00', bgcolor: '#fff9c4' },
  processing: { label: 'В обработке', color: '#0a3f8a', bgcolor: '#e3f2fd' },
  shipped: { label: 'Отправлен', color: '#006064', bgcolor: '#e0f7fa' },
  delivered: { label: 'Доставлен', color: '#1b5e20', bgcolor: '#e8f5e9' },
  cancelled: { label: 'Отменён', color: '#b71c1c', bgcolor: '#ffebee' },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#666', bgcolor: '#eee' };
  return (
    <span
      className="status-badge"
      style={{ color: config.color, backgroundColor: config.bgcolor }}
    >
      {config.label}
    </span>
  );
}
