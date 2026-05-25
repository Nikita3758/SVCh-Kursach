import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useNotification } from '../../context/AppContext';
import { ordersApi } from '../../api/endpoints';
import { formatPrice } from '../../utils/formatters';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems: items, clearCart } = useCart();
  const { notifySuccess, notifyError } = useNotification();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + Number(item.price ?? item.product?.price ?? 0) * item.quantity,
    0,
  );

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Введите адрес доставки');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await ordersApi.create({
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: Number(item.price ?? item.product?.price ?? 0),
        })),
      });
      clearCart();
      notifySuccess('Заказ успешно оформлен!');
      navigate('/orders');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Ошибка при оформлении заказа';
      setError(msg);
      notifyError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout">
      <div className="checkout__container">
        <h1 className="checkout__title">Оформление заказа</h1>

        <div className="checkout__layout">
          <form className="checkout__form" onSubmit={handleSubmit}>
            <div className="checkout__section">
              <h2 className="checkout__section-title">Доставка</h2>

              <div className="checkout__field">
                <label className="checkout__label">
                  Адрес доставки <span className="checkout__required">*</span>
                </label>
                <input
                  className={`checkout__input ${error && !address.trim() ? 'checkout__input--error' : ''}`}
                  type="text"
                  placeholder="Город, улица, дом, квартира"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Комментарий к заказу</label>
                <textarea
                  className="checkout__textarea"
                  placeholder="Пожелания по доставке, время и т.д."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="checkout__error">{error}</p>}

            <button type="submit" className="checkout__submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="checkout__spinner" />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Подтвердить заказ
                </>
              )}
            </button>

            <button type="button" className="checkout__back-btn" onClick={() => navigate('/cart')}>
              ← Вернуться в корзину
            </button>
          </form>

          <div className="checkout__summary">
            <h2 className="checkout__section-title">Ваш заказ</h2>
            <div className="checkout__summary-items">
              {items.map((item) => {
                const unitPrice = Number(item.price ?? item.product?.price ?? 0);
                return (
                  <div className="checkout__summary-item" key={item.productId}>
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop`
                      }
                      alt={item.product?.name}
                      className="checkout__summary-img"
                    />
                    <div className="checkout__summary-info">
                      <p className="checkout__summary-name">{item.product?.name || `Товар #${item.productId}`}</p>
                      <p className="checkout__summary-qty">× {item.quantity}</p>
                    </div>
                    <span className="checkout__summary-price">{formatPrice(unitPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <div className="checkout__summary-divider" />
            <div className="checkout__summary-total">
              <span>Итого:</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="checkout__delivery-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <path d="M16 8h4l3 5v4h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Бесплатная доставка по городу
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
