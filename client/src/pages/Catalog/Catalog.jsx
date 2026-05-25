import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useDebounce } from '../../hooks/useDebounce';
import { useCatalog } from '../../context/AppContext';
import { productsApi, categoriesApi } from '../../api/endpoints';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import './Catalog.css';
import './FilterSort.css';

export default function Catalog() {
  const location = useLocation();
  const { filters, sort, setFilters, setSort, resetFilters } = useCatalog();

  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 400);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  // Pre-fill category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('categoryId');
    if (cat) {
      setFilters({ category: Number(cat) });
      setExpanded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Sync debounced search to context
  useEffect(() => {
    setFilters({ search: debouncedSearch || undefined });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: categoriesData } = useFetch(() => categoriesApi.list(), []);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      material: filters.material,
      sort,
      page,
      limit: 12,
    }),
    [debouncedSearch, filters.category, filters.minPrice, filters.maxPrice, filters.material, sort, page],
  );

  const { data, isLoading } = useFetch(() => productsApi.list(queryParams), [queryParams]);
  const products = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const isActive =
    filters.category != null ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.material ||
    debouncedSearch !== '';

  const handleReset = () => {
    setSearch('');
    resetFilters();
    setPage(1);
  };

  return (
    <div className="catalog">
      <div className="catalog__container">
        <div className="catalog__header">
          <h1 className="catalog__title">Каталог мебели</h1>
        </div>

        <div className={`filter-sort ${isActive ? 'filter-sort--active' : ''}`}>
          <div className="filter-sort__top">
            <div className="filter-sort__search-wrap">
              <svg className="filter-sort__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="filter-sort__search"
                placeholder="Поиск мебели..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`filter-sort__toggle ${expanded ? 'filter-sort__toggle--open' : ''}`}
              onClick={() => setExpanded((v) => !v)}
            >
              Фильтры {isActive && <span className="filter-sort__active-dot" />}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <polyline points={expanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
              </svg>
            </button>
          </div>
          {expanded && (
            <div className="filter-sort__panel">
              <div className="filter-sort__row">
                <div className="filter-sort__field">
                  <label className="filter-sort__label">Категория</label>
                  <select
                    className="filter-sort__select"
                    value={filters.category ?? ''}
                    onChange={(e) => {
                      setFilters({ category: e.target.value ? Number(e.target.value) : undefined });
                      setPage(1);
                    }}
                  >
                    <option value="">Все категории</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-sort__field">
                  <label className="filter-sort__label">Цена от</label>
                  <input
                    type="number"
                    className="filter-sort__input"
                    value={filters.minPrice ?? ''}
                    onChange={(e) =>
                      setFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="filter-sort__field">
                  <label className="filter-sort__label">Цена до</label>
                  <input
                    type="number"
                    className="filter-sort__input"
                    value={filters.maxPrice ?? ''}
                    onChange={(e) =>
                      setFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="999999"
                    min="0"
                  />
                </div>
                <div className="filter-sort__field">
                  <label className="filter-sort__label">Сортировка</label>
                  <select
                    className="filter-sort__select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="newest">Сначала новые</option>
                    <option value="price_asc">По цене: возр.</option>
                    <option value="price_desc">По цене: убыв.</option>
                    <option value="name_asc">По названию А–Я</option>
                    <option value="rating">По рейтингу</option>
                  </select>
                </div>
              </div>
              {isActive && (
                <div className="filter-sort__footer">
                  <button className="filter-sort__reset" onClick={handleReset}>
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="catalog__grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="catalog-skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="catalog__empty">
            <p className="catalog__empty-title">Товары не найдены</p>
            <p className="catalog__empty-hint">Попробуйте изменить фильтры или поисковый запрос</p>
            {isActive && (
              <button className="catalog__reset-btn" onClick={handleReset}>
                Сбросить все фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="catalog__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="catalog__pagination">
            <button
              className="catalog__page-btn"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`catalog__page-btn ${p === page ? 'catalog__page-btn--active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="catalog__page-btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
