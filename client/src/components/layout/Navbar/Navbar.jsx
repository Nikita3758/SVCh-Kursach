import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);
  const linkCls = ({ isActive }) =>
    isActive ? 'header__link header__link--active' : 'header__link';

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo" onClick={closeMenu}>
          <span className="header__logo-icon">МД</span>
          <span className="header__logo-text">Мебельный Дом</span>
        </Link>

        <button
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Открыть меню"
        >
          <span /><span /><span />
        </button>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          <NavLink to="/" end className={linkCls} onClick={closeMenu}>Главная</NavLink>
          <NavLink to="/catalog" className={linkCls} onClick={closeMenu}>Каталог</NavLink>
          <NavLink to="/about" className={linkCls} onClick={closeMenu}>О нас</NavLink>

          {user ? (
            <>
              <NavLink to="/cart" className={linkCls} onClick={closeMenu}>
                Корзина {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/wishlist" className={linkCls} onClick={closeMenu}>Избранное</NavLink>
              <NavLink to="/orders" className={linkCls} onClick={closeMenu}>Заказы</NavLink>
              {(user.role?.name === 'admin' || user.roleId === 1) && (
                <NavLink to="/admin" className={linkCls} onClick={closeMenu}>Админ</NavLink>
              )}
              <div className="header__user-group">
                <NavLink to="/profile" className={linkCls} onClick={closeMenu}>
                  <span className="header__user-avatar">
                    {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                  {user.firstName || user.email}
                </NavLink>
                <button className="header__logout-btn" onClick={handleLogout} title="Выйти">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/cart" className={linkCls} onClick={closeMenu}>
                Корзина {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/login" className="header__link header__link--login" onClick={closeMenu}>Войти</NavLink>
              <NavLink to="/register" className="header__link header__link--register" onClick={closeMenu}>Регистрация</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
