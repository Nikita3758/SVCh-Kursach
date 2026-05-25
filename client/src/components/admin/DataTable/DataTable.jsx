import { useState } from 'react';

export default function DataTable({
  columns,
  rows,
  keyField,
  loading,
  total,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  title,
  actions,
  emptyMessage = 'Нет данных',
}) {
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (colId) => {
    if (sortBy === colId) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(colId);
      setSortDir('asc');
    }
  };

  const getValue = (row, id) => {
    const keys = String(id).split('.');
    let value = row;
    for (const key of keys) value = value?.[key];
    return value;
  };

  const sortedRows = sortBy
    ? [...rows].sort((a, b) => {
        const aVal = getValue(a, sortBy);
        const bVal = getValue(b, sortBy);
        if (aVal == null || bVal == null) return 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      })
    : rows;

  const totalPages = total !== undefined ? Math.max(1, Math.ceil(total / rowsPerPage)) : 1;

  return (
    <div className="data-table">
      {(title || actions) && (
        <div className="data-table__header">
          {title && <h3 className="data-table__title">{title}</h3>}
          {actions && <div className="data-table__actions">{actions}</div>}
        </div>
      )}
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.id)}
                  style={{ minWidth: col.minWidth, textAlign: col.align || 'left' }}
                  className={col.sortable ? 'data-table__sortable' : ''}
                  onClick={col.sortable ? () => handleSort(String(col.id)) : undefined}
                >
                  {col.label}
                  {col.sortable && sortBy === String(col.id) && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="data-table__loading">Загрузка...</td>
              </tr>
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">{emptyMessage}</td>
              </tr>
            ) : (
              sortedRows.map((row, rowIdx) => (
                <tr key={String(row[keyField]) || rowIdx}>
                  {columns.map((col) => {
                    const rawValue = getValue(row, String(col.id));
                    return (
                      <td key={String(col.id)} style={{ textAlign: col.align || 'left' }}>
                        {col.render ? col.render(rawValue, row) : String(rawValue ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total !== undefined && onPageChange && (
        <div className="data-table__pagination">
          {onRowsPerPageChange && (
            <div className="data-table__rpp">
              <span>Строк:</span>
              <select value={rowsPerPage} onChange={(e) => onRowsPerPageChange(Number(e.target.value))}>
                {[5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}
          <div className="data-table__info">
            {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, total)} из {total}
          </div>
          <div className="data-table__pager">
            <button disabled={page === 0} onClick={() => onPageChange(page - 1)}>←</button>
            <span>{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
