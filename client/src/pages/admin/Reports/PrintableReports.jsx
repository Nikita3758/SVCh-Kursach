import React, { forwardRef } from 'react';
import { formatPrice } from '../../../utils/formatters';
import './PrintableReports.css';

export const PrintableSalesReport = forwardRef(({ startDate, endDate, stats, salesData }, ref) => {
  return (
    <div className="printable-report" ref={ref}>
      <div className="printable-report__header">
        <h1 className="printable-report__title">Мебельный Дом</h1>
        <h2 className="printable-report__subtitle">Отчёт по продажам</h2>
        <p className="printable-report__meta">
          Период: {startDate} — {endDate} <br />
          Дата формирования: {new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="printable-report__summary">
        <div className="summary-card">
          <span className="summary-label">Общая выручка</span>
          <span className="summary-value highlight">{formatPrice(stats?.totalRevenue || 0)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Заказов</span>
          <span className="summary-value">{stats?.totalOrders || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Клиентов</span>
          <span className="summary-value">{stats?.totalUsers || 0}</span>
        </div>
      </div>

      <h3 className="printable-report__section-title">Продажи по месяцам</h3>
      <table className="printable-table">
        <thead>
          <tr>
            <th>Месяц</th>
            <th className="text-right">Выручка</th>
            <th className="text-center">Количество заказов</th>
          </tr>
        </thead>
        <tbody>
          {salesData && salesData.length > 0 ? (
            salesData.map((row, i) => (
              <tr key={i}>
                <td>{row.month}</td>
                <td className="text-right">{formatPrice(row.revenue)}</td>
                <td className="text-center">{row.orderCount || row.orders || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">Нет данных за выбранный период</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="printable-report__footer">
        <p>Документ сгенерирован автоматически системой управления магазином «Мебельный Дом».</p>
      </div>
    </div>
  );
});

export const PrintableInventoryReport = forwardRef(({ inventory }, ref) => {
  const byCategory = inventory?.byCategory || [];
  const lowStock = inventory?.lowStockAlerts || [];

  return (
    <div className="printable-report" ref={ref}>
      <div className="printable-report__header">
        <h1 className="printable-report__title">Мебельный Дом</h1>
        <h2 className="printable-report__subtitle">Складской отчёт</h2>
        <p className="printable-report__meta">
          Актуально на: {new Date().toLocaleDateString('ru-RU')}
        </p>
      </div>

      <div className="printable-report__summary">
        <div className="summary-card">
          <span className="summary-label">Всего товаров видов</span>
          <span className="summary-value">{inventory?.totalProducts || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Мало на складе</span>
          <span className="summary-value alert">{inventory?.lowStockCount || 0}</span>
        </div>
      </div>

      {lowStock.length > 0 && (
        <>
          <h3 className="printable-report__section-title alert-text">Внимание: Низкий остаток</h3>
          <table className="printable-table alert-table">
            <thead>
              <tr>
                <th>Наименование товара</th>
                <th className="text-center">Остаток, шт.</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td className="text-center font-bold text-red">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 className="printable-report__section-title">Остатки по категориям</h3>
      <table className="printable-table">
        <thead>
          <tr>
            <th>Категория</th>
            <th className="text-center">Кол-во товаров</th>
            <th className="text-center">Общий запас (шт.)</th>
          </tr>
        </thead>
        <tbody>
          {byCategory.length > 0 ? (
            byCategory.map((cat, i) => (
              <tr key={i}>
                <td>{cat.category}</td>
                <td className="text-center">{cat.count}</td>
                <td className="text-center">{cat.totalStock}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">Нет данных</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="printable-report__footer">
        <p>Документ сгенерирован автоматически системой управления магазином «Мебельный Дом».</p>
      </div>
    </div>
  );
});
