import { NavLink } from 'react-router-dom';

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const NAV_ITEMS = [
  {
    label: 'Панель управления',
    href: '/admin',
    icon: <Icon d={<><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>} />,
  },
  {
    label: 'Товары',
    href: '/admin/products',
    icon: <Icon d={<><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} />,
  },
  {
    label: 'Заказы',
    href: '/admin/orders',
    icon: <Icon d={<><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></>} />,
  },
  {
    label: 'Пользователи',
    href: '/admin/users',
    icon: <Icon d={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>} />,
  },
  {
    label: 'Отчёты',
    href: '/admin/reports',
    icon: <Icon d={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} />,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <div className="admin-sidebar__logo-icon">МД</div>
        <div>
          <div className="admin-sidebar__logo-text">Мебельный Дом</div>
          <div className="admin-sidebar__logo-sub">Панель управления</div>
        </div>
      </div>
      <nav className="admin-sidebar__nav">
        {NAV_ITEMS.map(({ label, href, icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/admin'}
            className={({ isActive }) =>
              `admin-sidebar__link${isActive ? ' admin-sidebar__link--active' : ''}`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar__footer">
        <NavLink to="/" className="admin-sidebar__link">
          <Icon d={<><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>} />
          На сайт
        </NavLink>
      </div>
    </aside>
  );
}
