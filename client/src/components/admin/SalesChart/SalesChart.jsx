import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
      fontSize: 13,
      minWidth: 160,
      pointerEvents: 'none',
    }}>
      <div style={{ fontWeight: 600, color: '#1a365d', marginBottom: 6 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: '#444', marginBottom: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: entry.fill, display: 'inline-block' }} />
            {entry.name}
          </span>
          <span style={{ fontWeight: 600, color: entry.fill === '#ffd700' ? '#b8860b' : '#1a365d' }}>
            {entry.name === 'Выручка'
              ? `${Number(entry.value).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} Br`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesChart({ data, title = 'Продажи по месяцам' }) {
  return (
    <div className="sales-chart">
      <h3 className="sales-chart__title">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#888' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#888' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(26,54,93,0.06)', radius: 6 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
            iconType="square"
            iconSize={10}
          />
          <Bar yAxisId="left" dataKey="revenue" name="Выручка" fill="#1a365d" radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Bar yAxisId="right" dataKey="orderCount" name="Заказы" fill="#ffd700" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
