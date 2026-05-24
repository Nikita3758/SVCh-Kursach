import './ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  title = 'Подтверждение',
  message,
  confirmLabel = 'Да',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className={`modal modal--${severity}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal__title">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {title}
        </div>
        <div className="modal__body">{message}</div>
        <div className="modal__actions">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className={severity === 'error' ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
