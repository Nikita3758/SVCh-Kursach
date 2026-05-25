import { useState, useRef } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { reportsApi } from '../../../api/endpoints';
import { useNotification } from '../../../context/AppContext';
import ReportButton from '../../../components/admin/ReportButton/ReportButton';
import SalesChart from '../../../components/admin/SalesChart/SalesChart';
import { formatPrice } from '../../../utils/formatters';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableSalesReport, PrintableInventoryReport } from './PrintableReports';
import '../../../styles/AdminPages.css';

const DEFAULT_SALES = [
  { month: 'Авг', revenue: 185000, orders: 62 },
  { month: 'Сен', revenue: 210000, orders: 74 },
  { month: 'Окт', revenue: 195000, orders: 68 },
  { month: 'Ноя', revenue: 320000, orders: 98 },
  { month: 'Дек', revenue: 485000, orders: 142 },
  { month: 'Янв', revenue: 285000, orders: 87 },
];

export default function AdminReports() {
  const { notifySuccess, notifyError } = useNotification();
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: stats } = useFetch(() => reportsApi.dashboard(), []);
  const salesData = stats?.salesByMonth?.length ? stats.salesByMonth : DEFAULT_SALES;

  const { data: inventory } = useFetch(() => reportsApi.inventory(), []);

  const salesRef = useRef(null);
  const invRef = useRef(null);

  const generateSalesPDF = async () => {
    if (!salesRef.current) return;
    const canvas = await html2canvas(salesRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`sales-report-${startDate}-${endDate}.pdf`);
  };

  const generateInventoryPDF = async () => {
    if (!invRef.current) return;
    const canvas = await html2canvas(invRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateDocx = async (reportType) => {
    const content =
      reportType === 'sales'
        ? `<html><head><meta charset="utf-8"></head><body><h1>Мебельный Дом - Отчёт по продажам</h1><p>Период: ${startDate} — ${endDate}</p><table border="1"><tr><th>Месяц</th><th>Выручка</th><th>Заказы</th></tr>${salesData
            .map((r) => `<tr><td>${r.month}</td><td>${r.revenue}</td><td>${r.orderCount || r.orders || 0}</td></tr>`)
            .join('')}</table></body></html>`
        : `<html><head><meta charset="utf-8"></head><body><h1>Мебельный Дом - Складской отчёт</h1><p>Дата: ${new Date().toLocaleDateString('ru-RU')}</p><table border="1"><tr><th>Категория</th><th>Видов товаров</th><th>Общий остаток</th></tr>${(inventory?.byCategory || [])
            .map((cat) => `<tr><td>${cat.category}</td><td>${cat.count}</td><td>${cat.totalStock}</td></tr>`)
            .join('')}</table></body></html>`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSalesDownload = async (format) => {
    try {
      if (format === 'pdf') await generateSalesPDF();
      else await generateDocx('sales');
      notifySuccess(`Отчёт по продажам скачан (${format.toUpperCase()})`);
    } catch {
      notifyError('Ошибка при генерации отчёта');
    }
  };

  const handleInventoryDownload = async (format) => {
    try {
      if (format === 'pdf') await generateInventoryPDF();
      else await generateDocx('inventory');
      notifySuccess(`Складской отчёт скачан (${format.toUpperCase()})`);
    } catch {
      notifyError('Ошибка при генерации отчёта');
    }
  };

  return (
    <div className="admin-page admin-reports">
      <h1 className="admin-page__title">Отчёты</h1>

      <div className="admin-reports__grid">
        <div className="admin-report-card">
          <div className="admin-report-card__header">
            <div className="admin-report-card__icon admin-report-card__icon--sales">📊</div>
            <h3>Отчёт по продажам</h3>
          </div>
          <p className="admin-report-card__desc">
            Детальный отчёт по продажам за выбранный период, включая выручку, количество заказов и
            статистику по клиентам.
          </p>
          <div className="admin-report-card__dates">
            <div className="admin-form__field">
              <label>Период с</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="admin-form__field">
              <label>Период по</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <ul className="admin-report-card__checklist">
            <li>Общая выручка и количество заказов</li>
            <li>Статистика по клиентам</li>
            <li>Продажи по категориям</li>
            <li>Сравнение по месяцам</li>
          </ul>
          <ReportButton label="Скачать отчёт по продажам" onDownload={handleSalesDownload} />
        </div>

        <div className="admin-report-card">
          <div className="admin-report-card__header">
            <div className="admin-report-card__icon admin-report-card__icon--inv">📦</div>
            <h3>Складской отчёт</h3>
          </div>
          <p className="admin-report-card__desc">
            Полный обзор имеющихся товаров на складе, включая количество по категориям и товары с
            низкими остатками.
          </p>
          <div className="admin-report-card__info">
            Актуальные данные на: {new Date().toLocaleDateString('ru-RU')}
          </div>
          <ul className="admin-report-card__checklist">
            <li>Остатки по категориям</li>
            <li>Товары с низким запасом</li>
            <li>Недоступные товары</li>
            <li>Общая стоимость склада</li>
          </ul>
          <ReportButton label="Скачать складской отчёт" onDownload={handleInventoryDownload} />
        </div>
      </div>

      <div className="admin-reports__chart">
        <SalesChart data={salesData} title="Предварительный просмотр данных для отчёта" />
      </div>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PrintableSalesReport
          ref={salesRef}
          startDate={startDate}
          endDate={endDate}
          stats={stats}
          salesData={salesData}
        />
        <PrintableInventoryReport
          ref={invRef}
          inventory={inventory}
        />
      </div>
    </div>
  );
}
