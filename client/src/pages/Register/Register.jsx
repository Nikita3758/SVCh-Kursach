import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AppContext';
import { authApi } from '../../api/endpoints';
import '../Login/Login.css';

export default function Register() {
  const navigate = useNavigate();
  const { setCredentials } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setCredentials(result.user, result.token);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Ошибка регистрации.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-card__header">
          <div className="auth-card__logo">МД</div>
          <h1 className="auth-card__title">Регистрация</h1>
          <p className="auth-card__subtitle">Мебельный Дом</p>
        </div>
        <form className="auth-card__body" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-field">
            <label>Имя</label>
            <input type="text" value={form.firstName} onChange={update('firstName')} placeholder="Иван" required autoFocus />
          </div>
          <div className="auth-field">
            <label>Фамилия</label>
            <input type="text" value={form.lastName} onChange={update('lastName')} placeholder="Иванов" required />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="your@email.com" required />
          </div>
          <div className="auth-field">
            <label>Пароль</label>
            <input type="password" value={form.password} onChange={update('password')} placeholder="Минимум 6 символов" required minLength={6} />
          </div>
          <div className="auth-field">
            <label>Подтвердить пароль</label>
            <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Повторите пароль" required />
          </div>
          <div className="auth-role-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Регистрация создаёт аккаунт покупателя
          </div>
          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          <p className="auth-link">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
