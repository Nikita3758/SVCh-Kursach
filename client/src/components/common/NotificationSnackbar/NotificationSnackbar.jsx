import { useEffect } from 'react';
import { useNotification } from '../../../context/AppContext';

export default function NotificationSnackbar() {
  const { notification, hideNotification } = useNotification();
  const { open, message, severity } = notification;

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(hideNotification, 4000);
    return () => clearTimeout(t);
  }, [open, message, hideNotification]);

  if (!open) return null;

  return (
    <div className={`snackbar snackbar--${severity}`} role="alert">
      <span className="snackbar__message">{message}</span>
      <button className="snackbar__close" onClick={hideNotification} aria-label="Закрыть">
        ×
      </button>
    </div>
  );
}
