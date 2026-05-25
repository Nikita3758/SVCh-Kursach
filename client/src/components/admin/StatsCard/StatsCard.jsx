export default function StatsCard({ title, value, subtitle, icon, color = '#1a365d', trend }) {
  return (
    <div className="stats-card">
      <div className="stats-card__bg" style={{ backgroundColor: color }} />
      <div className="stats-card__content">
        <div className="stats-card__label">{title}</div>
        <div className="stats-card__value">{value}</div>
        {subtitle && <div className="stats-card__subtitle">{subtitle}</div>}
        {trend !== undefined && (
          <div className={`stats-card__trend ${trend >= 0 ? 'stats-card__trend--up' : 'stats-card__trend--down'}`}>
            {trend >= 0 ? '↗' : '↘'} {trend >= 0 ? '+' : ''}
            {trend}% за этот месяц
          </div>
        )}
      </div>
      <div className="stats-card__icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  );
}
