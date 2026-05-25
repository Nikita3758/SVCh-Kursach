import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/AppContext';
import { formatPrice } from '../../utils/formatters';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems: items, updateCartItemQuantity, removeCartItem, clearCart } = useCart();
  const total = items.reduce(
    (sum, item) => sum + Number(item.price ?? item.product?.price ?? 0) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <div className="cart">
        <div className="cart__container">
          <h1 className="cart__title">Корзина</h1>
          <div className="cart__empty">
            <div className="cart__empty-icon">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
            </div>
            <p className="cart__empty-title">Корзина пуста</p>
            <p className="cart__empty-hint">Добавьте товары из каталога</p>
            <Link to="/catalog" className="cart__to-catalog">Перейти в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart__container">
        <div className="cart__header">
          <h1 className="cart__title">Корзина</h1>
          <button className="cart__clear-btn" onClick={clearCart}>
            Очистить корзину
          </button>
        </div>
        <div className="cart__layout">
          <div className="cart__items">
            {items.map((item) => {
              const unitPrice = Number(item.price ?? item.product?.price ?? 0);
              return (
                <div className="cart-item" key={item.productId}>
                  <div
                    className="cart-item__image-wrap"
                    onClick={() => navigate(`/products/${item.productId}`)}
                  >
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop`
                      }
                      alt={item.product?.name}
                      className="cart-item__image"
                    />
                  </div>
                  <div className="cart-item__info">
                    <h3 className="cart-item__name">{item.product?.name || `Товар #${item.productId}`}</h3>
                    <span className="cart-item__category">{item.product?.category?.name || 'Мебель'}</span>
                    <p className="cart-item__unit-price">{formatPrice(unitPrice)}</p>
                  </div>
                  <div className="cart-item__controls">
                    <div className="cart-item__qty">
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="cart-item__qty-input"
                        value={item.quantity}
                        min="1"
                        max="99"
                        onChange={(e) =>
                          updateCartItemQuantity(item.productId, parseInt(e.target.value) || 1)
                        }
                      />
                      <button
                        className="cart-item__qty-btn"
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item__total">{formatPrice(unitPrice * item.quantity)}</p>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeCartItem(item.productId)}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          <div className="cart__summary">
            <div className="cart__summary-card">
              <h2 className="cart__summary-title">Итого</h2>
              <div className="cart__summary-rows">
                {items.map((item) => {
                  const unitPrice = Number(item.price ?? item.product?.price ?? 0);
                  return (
                    <div className="cart__summary-row" key={item.productId}>
                      <span className="cart__summary-name">
                        {item.product?.name || `Товар #${item.productId}`}{' '}
                        {item.quantity > 1 && (
                          <span className="cart__summary-qty">x{item.quantity}</span>
                        )}
                      </span>
                      <span className="cart__summary-price">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="cart__summary-divider" />
              <div className="cart__summary-total">
                <span>Итого:</span>
                <span className="cart__summary-total-price">{formatPrice(total)}</span>
              </div>
              <button className="cart__checkout-btn" onClick={() => navigate('/checkout')}>
                Оформить заказ
              </button>
              <Link to="/catalog" className="cart__continue">← Продолжить покупки</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
