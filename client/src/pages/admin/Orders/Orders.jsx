import { useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { ordersApi } from '../../../api/endpoints';
import { useNotification } from '../../../context/AppContext';
import DataTable from '../../../components/admin/DataTable/DataTable';
import OrderStatusBadge from '../../../components/orders/OrderStatusBadge/OrderStatusBadge';
import { formatPrice, formatDate, formatOrderId } from '../../../utils/formatters';
import '../../../styles/AdminPages.css';

const ORDER_STATUSES = [
  { value: 'pending', label: 'В ожидании' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
];

export default function AdminOrders() {
  const { notifySuccess, notifyError } = useNotification();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const { data, isLoading, refetch } = useFetch(
    () =>
      ordersApi.list({
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    [page, rowsPerPage, statusFilter],
  );

  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    setUpdating(true);
    try {
      await ordersApi.updateStatus(editingOrder.id, newStatus);
      notifySuccess('Статус заказа обновлён');
      setEditingOrder(null);
      refetch();
    } catch {
      notifyError('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { id: 'id', label: '№', render: (val) => formatOrderId(Number(val)) },
    {
      id: 'user',
      label: 'Клиент',
      render: (_, row) =>
        row.user ? `${row.user.firstName} ${row.user.lastName}` : `#${row.userId}`,
    },
    { id: 'createdAt', label: 'Дата', sortable: true, render: (val) => formatDate(String(val)) },
    {
      id: 'totalAmount',
      label: 'Сумма',
      align: 'right',
      sortable: true,
      render: (val) => formatPrice(Number(val)),
    },
    {
      id: 'items',
      label: 'Товаров',
      align: 'center',
      render: (_, row) => row.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0,
    },
    {
      id: 'status',
      label: 'Статус',
      render: (val) => <OrderStatusBadge status={val} />,
    },
    {
      id: 'id',
      label: 'Действия',
      align: 'center',
      render: (_, row) => (
        <div className="admin-actions">
          <button
            className="admin-icon-btn"
            onClick={() => setViewOrder(row)}
            title="Просмотреть"
          >
            👁
          </button>
          <button
            className="admin-icon-btn admin-icon-btn--edit"
            onClick={() => handleOpenEdit(row)}
            title="Изменить статус"
          >
            ✎
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Управление заказами</h1>
        <select
          className="admin-search"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">Все заказы</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        keyField="id"
        loading={isLoading}
        total={data?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        emptyMessage="Заказы не найдены"
      />

      {editingOrder && (
        <div className="admin-modal">
          <div className="admin-modal__backdrop" onClick={() => setEditingOrder(null)} />
          <div className="admin-modal__content admin-modal__content--sm">
            <div className="admin-modal__header">
              <h2>Статус заказа {formatOrderId(editingOrder.id)}</h2>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form__field">
                <label>Новый статус</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn" onClick={() => setEditingOrder(null)}>
                Отмена
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleUpdateStatus}
                disabled={updating}
              >
                {updating ? 'Сохранение...' : 'Обновить статус'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewOrder && (
        <div className="admin-modal">
          <div className="admin-modal__backdrop" onClick={() => setViewOrder(null)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>Заказ {formatOrderId(viewOrder.id)}</h2>
            </div>
            <div className="admin-modal__body">
              <div className="admin-view-rows">
                <div className="admin-view-row">
                  <span className="admin-view-row__label">Статус</span>
                  <OrderStatusBadge status={viewOrder.status} />
                </div>
                <div className="admin-view-row">
                  <span className="admin-view-row__label">Дата</span>
                  <span>{formatDate(viewOrder.createdAt)}</span>
                </div>
                <div className="admin-view-row">
                  <span className="admin-view-row__label">Клиент</span>
                  <span>
                    {viewOrder.user
                      ? `${viewOrder.user.firstName} ${viewOrder.user.lastName}`
                      : `#${viewOrder.userId}`}
                  </span>
                </div>
                <div className="admin-view-row">
                  <span className="admin-view-row__label">Адрес</span>
                  <span>{viewOrder.deliveryAddress}</span>
                </div>
                {viewOrder.notes && (
                  <div className="admin-view-row">
                    <span className="admin-view-row__label">Комментарий</span>
                    <span>{viewOrder.notes}</span>
                  </div>
                )}
                {viewOrder.items && viewOrder.items.length > 0 && (
                  <div className="admin-view-items">
                    <h4>Товары</h4>
                    {viewOrder.items.map((item) => (
                      <div className="admin-view-item" key={item.id}>
                        <span>
                          {item.product?.name || `Товар #${item.productId}`} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="admin-view-total">
                  <strong>Итого</strong>
                  <strong>{formatPrice(viewOrder.totalAmount)}</strong>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn" onClick={() => setViewOrder(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
