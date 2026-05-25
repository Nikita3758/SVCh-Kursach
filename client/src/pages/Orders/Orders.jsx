import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { ordersApi } from '../../api/endpoints';
import { useNotification } from '../../context/AppContext';
import OrderCard from '../../components/orders/OrderCard/OrderCard';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import './Orders.css';

export default function Orders() {
  const { notifySuccess, notifyError } = useNotification();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading, refetch } = useFetch(
    () =>
      ordersApi.list({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    [page, statusFilter],
  );

  const orders = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleCancel = async () => {
    if (!cancelOrderId) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(cancelOrderId);
      notifySuccess('Заказ отменён');
      setCancelOrderId(null);
      refetch();
    } catch {
      notifyError('Ошибка при отмене заказа');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) return <Loader message="Загрузка заказов..." />;

  return (
    <div className="orders-page">
      <div className="orders-page__container">
        <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Мои заказы' }]} />

        <div className="orders-page__header">
          <h1 className="orders-page__title">Мои заказы</h1>
          <select
            className="orders-page__filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все заказы</option>
            <option value="pending">В ожидании</option>
            <option value="processing">В обработке</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            title="Заказы не найдены"
            message={
              statusFilter !== 'all'
                ? 'Нет заказов с таким статусом'
                : 'У вас ещё нет ни одного заказа'
            }
          />
        ) : (
          <>
            <div className="orders-page__list">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onCancel={(id) => setCancelOrderId(id)}
                  cancelling={cancelling}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="orders-page__pagination">
                <button
                  className="orders-page__page-btn"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`orders-page__page-btn ${p === page ? 'orders-page__page-btn--active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="orders-page__page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={cancelOrderId !== null}
        title="Отменить заказ"
        message="Вы уверены, что хотите отменить этот заказ?"
        onConfirm={handleCancel}
        onCancel={() => setCancelOrderId(null)}
        severity="warning"
        loading={cancelling}
        confirmLabel="Отменить заказ"
      />
    </div>
  );
}
