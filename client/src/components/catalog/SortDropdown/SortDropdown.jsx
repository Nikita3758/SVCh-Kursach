const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'name_asc', label: 'По названию А-Я' },
  { value: 'rating_desc', label: 'По рейтингу' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-dropdown">
      <label className="sort-dropdown__label">Сортировка:</label>
      <select
        className="sort-dropdown__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
