export default function EmptyState({ title = 'Ничего не найдено', message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
        </svg>
      </div>
      <div className="empty-state__title">{title}</div>
      {message && <div className="empty-state__text">{message}</div>}
      {actionLabel && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
