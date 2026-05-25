import { useState } from 'react';

export default function ReportButton({ label = 'Скачать отчёт', onDownload, disabled }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null);

  const handleDownload = async (format) => {
    setOpen(false);
    setLoading(format);
    try {
      await onDownload(format);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="report-button">
      <button
        type="button"
        className="btn-primary report-button__trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || loading !== null}
      >
        {loading ? 'Загрузка...' : label} ▾
      </button>
      {open && (
        <div className="report-button__menu">
          <button onClick={() => handleDownload('pdf')}>PDF</button>
          <button onClick={() => handleDownload('docx')}>Word (DOCX)</button>
        </div>
      )}
    </div>
  );
}
