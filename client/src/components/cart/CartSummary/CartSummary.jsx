import { formatPrice } from '../../../utils/formatters';

export default function CartSummary({ items, onCheckout, loading }) {
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.price ?? item.product?.price ?? 0);
    return sum + price * item.quantity;
  }, 0);

  const shippingThreshold = 5000;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 250;
  const total = subtotal + shippingCost;
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="cart-summary">
      <h3 className="cart-summary__title">Итого</h3>

      <div className="cart-summary__row">
        <span>Товары ({itemsCount} шт.)</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="cart-summary__row">
        <span>Доставка</span>
        <span className={shippingCost === 0 ? 'cart-summary__free' : ''}>
          {shippingCost === 0 ? 'Бесплатно' : formatPrice(shippingCost)}
        </span>
      </div>
      {subtotal < shippingThreshold && (
        <div className="cart-summary__hint">
          Закажите ещё на {formatPrice(shippingThreshold - subtotal)} для бесплатной доставки
        </div>
      )}
      <hr className="cart-summary__divider" />
      <div className="cart-summary__total">
        <span>Итого</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      <button
        type="button"
        className="btn-primary cart-summary__btn"
        onClick={onCheckout}
        disabled={loading || items.length === 0}
      >
        Оформить заказ
      </button>
    </aside>
  );
}
