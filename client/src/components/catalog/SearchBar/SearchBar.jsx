import { useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';

export default function SearchBar({ value = '', onSearch, placeholder = 'Поиск мебели...' }) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, 400);

  useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="search-bar">
      <span className="search-bar__icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        className="search-bar__input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
      />
      {inputValue && (
        <button className="search-bar__clear" onClick={() => setInputValue('')} type="button">
          ×
        </button>
      )}
    </div>
  );
}
