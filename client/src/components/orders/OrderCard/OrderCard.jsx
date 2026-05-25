import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate, formatOrderId } from '../../../utils/formatters';
import OrderStatusBadge from '../OrderStatusBadge/OrderStatusBadge';

export default function OrderCard({ order, onCancel, cancelling }) {
  const navigate = useNavigate();
  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div>
          <div className="order-card__id">Заказ {formatOrderId(order.id)}</div>
          <div className="order-card__date">{formatDate(order.createdAt)}</div>
        </div>
        <div className="order-card__header-right">
          <OrderStatusBadge status={order.status} />
          {canCancel && onCancel && (
            <button
              type="button"
              className="btn-outline-danger"
              onClick={() => onCancel(order.id)}
              disabled={cancelling}
            >
              Отменить
            </button>
          )}
        </div>
      </div>

      <div className="order-card__items">
        {order.items && order.items.length > 0 ? (
          order.items.map((item) => {
            const imgUrl =
              item.product?.images?.find((i) => i.isMain)?.url ||
              item.product?.images?.[0]?.url ||
              `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop`;
            return (
              <div key={item.id} className="order-card__item">
                <img
                  className="order-card__item-img"
                  src={imgUrl}
                  alt={item.product?.name || 'Товар'}
                  onClick={() => navigate(`/products/${item.productId}`)}
                />
                {item.quantity > 1 && <span className="order-card__qty">{item.quantity}</span>}
              </div>
            );
          })
        ) : (
          <div className="order-card__empty">Детали заказа недоступны</div>
        )}
      </div>

      <div className="order-card__footer">
        <div className="order-card__address">{order.deliveryAddress}</div>
        <div className="order-card__total">{formatPrice(order.totalAmount)}</div>
      </div>
    </div>
  );
}
