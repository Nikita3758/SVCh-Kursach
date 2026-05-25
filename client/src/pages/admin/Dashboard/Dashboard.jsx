import { useFetch } from '../../../hooks/useFetch';
import { reportsApi } from '../../../api/endpoints';
import StatsCard from '../../../components/admin/StatsCard/StatsCard';
import SalesChart from '../../../components/admin/SalesChart/SalesChart';
import Loader from '../../../components/common/Loader/Loader';
import OrderStatusBadge from '../../../components/orders/OrderStatusBadge/OrderStatusBadge';
import { formatPrice, formatDate, formatOrderId } from '../../../utils/formatters';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const STATUS_COLORS = {
  pending: '#ffd700',
  processing: '#2c5282',
  shipped: '#00bcd4',
  delivered: '#27ae60',
  cancelled: '#e74c3c',
};

const STATUS_LABELS = {
  pending: 'В ожидании',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

const IconPeople = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
  </svg>
);
const IconMoney = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useFetch(() => reportsApi.dashboard(), []);

  if (isLoading) return <Loader message="Загрузка панели управления..." />;

  const s = stats || {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    ordersByStatus: [],
    salesByMonth: [],
    topProducts: [],
  };

  const pieData = (s.ordersByStatus || []).map(({ status, count }) => ({
    name: STATUS_LABELS[status] || status,
    value: Number(count),
    color: STATUS_COLORS[status] || '#999',
  })).filter(d => d.value > 0);

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard__title">Панель управления</h1>

      <div className="admin-dashboard__stats">
        <StatsCard title="Пользователи" value={s.totalUsers.toLocaleString()} icon={<IconPeople />} color="#1a365d" trend={12} />
        <StatsCard title="Товары" value={s.totalProducts.toLocaleString()} icon={<IconBox />} color="#2c5282" trend={5} />
        <StatsCard title="Заказы" value={s.totalOrders.toLocaleString()} icon={<IconCart />} color="#ffd700" trend={23} />
        <StatsCard title="Выручка" value={formatPrice(s.totalRevenue)} icon={<IconMoney />} color="#27ae60" trend={18} />
      </div>

      <div className="admin-dashboard__charts">
        <div className="admin-dashboard__chart-main">
          <SalesChart data={s.salesByMonth || []} />
        </div>
        <div className="admin-dashboard__chart-side">
          <h3 className="admin-dashboard__chart-title">Заказы по статусу</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} заказов`, name]}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                    fontSize: 13,
                  }}
                  itemStyle={{ color: '#1a365d', fontWeight: 600 }}
                />
                <Legend formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: '#999' }}>
              Нет данных о заказах
            </div>
          )}
        </div>
      </div>

      {(s.recentOrders || []).length > 0 && (
        <div className="admin-dashboard__recent">
          <h3 className="admin-dashboard__recent-title">Последние заказы</h3>
          <table className="admin-dashboard__table">
            <thead>
              <tr>
                <th>№</th>
                <th>Клиент</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {s.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{formatOrderId(order.id)}</td>
                  <td>
                    <div className="admin-dashboard__client">
                      <div className="admin-dashboard__avatar">
                        {order.user?.firstName?.charAt(0) || '?'}
                      </div>
                      <span>
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : '-'}
                      </span>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatPrice(order.totalAmount)}</td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
