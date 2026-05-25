import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatters';

export default function CartItem({ item, onUpdateQuantity, onRemove, loading }) {
  const navigate = useNavigate();
  const product = item.product;
  const imageUrl =
    product?.images?.find((img) => img.isMain)?.url ||
    product?.images?.[0]?.url ||
    `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop`;

  const handleDecrease = () => {
    if (item.quantity > 1) onUpdateQuantity(item.productId, item.quantity - 1);
  };
  const handleIncrease = () => {
    if (!product || item.quantity < product.stock) {
      onUpdateQuantity(item.productId, item.quantity + 1);
    }
  };

  const price = Number(item.price ?? product?.price ?? 0);

  return (
    <div className={`cart-item ${loading ? 'cart-item--loading' : ''}`}>
      <img
        src={imageUrl}
        alt={product?.name || 'Товар'}
        className="cart-item__image"
        onClick={() => navigate(`/products/${item.productId}`)}
      />
      <div className="cart-item__body">
        <div>
          <h4
            className="cart-item__name"
            onClick={() => navigate(`/products/${item.productId}`)}
          >
            {product?.name || `Товар #${item.productId}`}
          </h4>
          {product?.material && (
            <div className="cart-item__meta">Материал: {product.material}</div>
          )}
        </div>
        <div className="cart-item__footer">
          <div className="cart-item__qty">
            <button onClick={handleDecrease} disabled={item.quantity <= 1 || loading}>−</button>
            <span>{item.quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={(product && item.quantity >= product.stock) || loading}
            >
              +
            </button>
          </div>
          <div className="cart-item__price">{formatPrice(price * item.quantity)}</div>
          <button
            className="cart-item__remove"
            onClick={() => onRemove(item.productId)}
            disabled={loading}
            title="Удалить"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
