import { useState, useEffect } from 'react';

const MATERIALS = ['Дерево', 'МДФ', 'ЛДСП', 'Металл', 'Ткань', 'Кожа', 'Стекло', 'Пластик'];
const PRICE_MIN = 0;
const PRICE_MAX = 150000;

export default function FilterPanel({ categories = [], filters, onFilterChange, onReset }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? PRICE_MAX);

  useEffect(() => {
    setMinPrice(filters.minPrice ?? PRICE_MIN);
    setMaxPrice(filters.maxPrice ?? PRICE_MAX);
  }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = () => onFilterChange({ minPrice, maxPrice });

  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h3 className="filter-panel__title">Фильтры</h3>
        <button type="button" className="filter-panel__reset" onClick={onReset}>
          Сбросить
        </button>
      </div>

      <div className="filter-panel__section">
        <h4 className="filter-panel__section-title">Категория</h4>
        <ul className="filter-panel__list">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                className={`filter-panel__cat-btn ${
                  filters.category === cat.id ? 'filter-panel__cat-btn--active' : ''
                }`}
                onClick={() =>
                  onFilterChange({ category: filters.category === cat.id ? undefined : cat.id })
                }
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="filter-panel__section">
        <h4 className="filter-panel__section-title">Ценовой диапазон</h4>
        <div className="filter-panel__price-inputs">
          <input
            type="number"
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
            onBlur={applyPrice}
            placeholder="от"
          />
          <span>—</span>
          <input
            type="number"
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
            onBlur={applyPrice}
            placeholder="до"
          />
        </div>
      </div>

      <div className="filter-panel__section">
        <h4 className="filter-panel__section-title">Материал</h4>
        <div className="filter-panel__materials">
          {MATERIALS.map((m) => (
            <label key={m} className="filter-panel__checkbox">
              <input
                type="checkbox"
                checked={filters.material === m}
                onChange={(e) => onFilterChange({ material: e.target.checked ? m : undefined })}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
