import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/AppContext';
import { useFetch } from '../../hooks/useFetch';
import { productsApi } from '../../api/endpoints';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Loader from '../../components/common/Loader/Loader';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb';
import './Wishlist.css';

export default function Wishlist() {
  const navigate = useNavigate();
  const { favoriteIds } = useFavorites();

  const { data, isLoading } = useFetch(
    () =>
      favoriteIds.length > 0
        ? productsApi.list({ limit: 100 })
        : Promise.resolve({ data: [] }),
    [favoriteIds.length],
  );

  const favoriteProducts = (data?.data ?? []).filter((p) => favoriteIds.includes(p.id));

  if (isLoading && favoriteIds.length > 0) return <Loader message="Загрузка избранных товаров..." />;

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__container">
        <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Избранное' }]} />

        <h1 className="wishlist-page__title">
          Избранное
          {favoriteIds.length > 0 && (
            <span className="wishlist-page__count">({favoriteIds.length})</span>
          )}
        </h1>

        {favoriteIds.length === 0 ? (
          <EmptyState
            title="Список избранного пуст"
            message="Добавьте товары в избранное, чтобы быстро находить их позже"
            actionLabel="Перейти в каталог"
            onAction={() => navigate('/catalog')}
          />
        ) : (
          <div className="wishlist-page__grid">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
