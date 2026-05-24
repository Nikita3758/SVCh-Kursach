import ProductCard from '../ProductCard';
import EmptyState from '../EmptyState';
import Loader from '../Loader';

export default function ProductGrid({ products, loading, totalPages, currentPage, onPageChange }) {
  if (loading) return <Loader message="Загрузка товаров..." />;

  if (!products || !products.length) {
    return (
      <EmptyState
        title="Товары не найдены"
        message="Попробуйте изменить фильтры или поисковый запрос"
      />
    );
  }

  return (
    <div>
      <div className="catalog__grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="pagination">
          <button
            className="pagination__btn"
            onClick={() => onPageChange(Math.max(1, (currentPage || 1) - 1))}
            disabled={(currentPage || 1) <= 1}
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`pagination__btn ${p === currentPage ? 'pagination__btn--active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className="pagination__btn"
            onClick={() => onPageChange(Math.min(totalPages, (currentPage || 1) + 1))}
            disabled={(currentPage || 1) >= totalPages}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
