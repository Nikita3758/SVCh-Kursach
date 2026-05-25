import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { authApi } from '../../api/endpoints';
import './Login.css';

const DEMO_ACCOUNTS = [
  { label: 'Администратор', email: 'admin@mebeldom.ru', password: 'password123', role: 'admin' },
  { label: 'Покупатель', email: 'ivan@mail.ru', password: 'password123', role: 'customer' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { setCredentials } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await authApi.login({ email, password });
      setCredentials(result.user, result.token);
      const isAdmin = result.user?.role?.name === 'admin' || result.user?.roleId === 1;
      navigate(isAdmin ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">МД</div>
          <h1 className="auth-card__title">Вход</h1>
          <p className="auth-card__subtitle">Мебельный Дом</p>
        </div>
        <form className="auth-card__body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
          <p className="auth-link">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>

        <div className="auth-demo">
          <p className="auth-demo__title">Демо-доступ</p>
          <div className="auth-demo__accounts">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className={`auth-demo__btn auth-demo__btn--${acc.role}`}
                onClick={() => fillDemo(acc)}
              >
                <span className="auth-demo__role">{acc.label}</span>
                <span className="auth-demo__email">{acc.email}</span>
              </button>
            ))}
          </div>
          <p className="auth-demo__hint">
            Пароль для всех: <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
