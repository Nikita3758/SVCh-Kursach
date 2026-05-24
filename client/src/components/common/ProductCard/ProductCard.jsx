import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useCart, useFavorites } from '../../../context/AppContext';
import { formatPrice } from '../../../utils/formatters';
import './ProductCard.css';

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill={filled ? '#e74c3c' : 'none'} stroke={filled ? '#e74c3c' : '#999'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { cartItems, addCartItem } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const inCart = cartItems.some((i) => i.productId === product.id);
  const inFavorites = isFavorite(product.id);

  const mainImage =
    product.images?.find((img) => img.isMain)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop';

  const requireAuth = () => navigate('/login', { state: { from: location.pathname } });

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!token) return requireAuth();
    addCartItem({
      id: Date.now(),
      userId: 0,
      productId: product.id,
      product,
      quantity: 1,
      price: product.price,
    });
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    if (!token) return requireAuth();
    if (inFavorites) removeFavorite(product.id);
    else addFavorite(product.id);
  };

  return (
    <div className="product-card">
      <div className="product-card__image-wrap" onClick={() => navigate(`/products/${product.id}`)}>
        <img src={mainImage} alt={product.name} className="product-card__image" />
        <span className={`product-card__stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
          {product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
        </span>
        <button
          className={`product-card__fav-btn ${inFavorites ? 'product-card__fav-btn--active' : ''}`}
          onClick={handleFavoriteToggle}
          title={inFavorites ? 'Убрать из избранного' : 'В избранное'}
        >
          <HeartIcon filled={inFavorites} />
        </button>
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category?.name || 'Мебель'}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <p className="product-card__price">{formatPrice(product.price)}</p>
      </div>
      <div className="product-card__footer">
        <button
          className={`card-btn card-btn--cart ${inCart ? 'card-btn--in-cart' : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {inCart ? 'В корзине' : 'В корзину'}
        </button>
      </div>
    </div>
  );
}
