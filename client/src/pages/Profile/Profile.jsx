import { useState } from 'react';
import { useAuth, useCart, useFavorites, useCatalog, useNotification } from '../../context/AppContext';
import { authApi } from '../../api/endpoints';
import { resetUserSettings } from '../../utils/localStorage';
import Breadcrumb from '../../components/common/Breadcrumb/Breadcrumb';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import { getInitials } from '../../utils/formatters';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { clearCart } = useCart();
  const { setFavorites } = useFavorites();
  const { resetFilters } = useCatalog();
  const { notifySuccess, notifyError } = useNotification();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const handleProfileSave = async () => {
    setUpdatingProfile(true);
    try {
      const updated = await authApi.updateProfile(profileData);
      setUser(updated);
      notifySuccess('Профиль успешно обновлён');
    } catch {
      notifyError('Ошибка при обновлении профиля');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setPasswordError('');
    setChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      notifySuccess('Пароль успешно изменён');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      notifyError('Ошибка при смене пароля. Проверьте текущий пароль.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetSettings = () => {
    resetUserSettings();
    resetFilters();
    clearCart();
    setFavorites([]);
    setResetConfirmOpen(false);
    notifySuccess('Настройки сброшены');
  };

  return (
    <div className="profile-page">
      <div className="profile-page__container">
        <Breadcrumb items={[{ label: 'Главная', href: '/' }, { label: 'Профиль' }]} />

        <h1 className="profile-page__title">Мой профиль</h1>

        <div className="profile-card profile-card--header">
          <div className="profile-avatar">{getInitials(user.firstName, user.lastName)}</div>
          <div className="profile-user-info">
            <h2 className="profile-user-info__name">
              {user.firstName} {user.lastName}
            </h2>
            <p className="profile-user-info__email">{user.email}</p>
            <span className="profile-user-info__role">
              {user.role?.name === 'admin' ? 'Администратор' : 'Покупатель'}
            </span>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card profile-card--personal">
            <h3 className="profile-card__title">Личная информация</h3>
            <div className="profile-form">
              <div className="profile-form__row">
                <div className="profile-field">
                  <label>Имя</label>
                  <input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  />
                </div>
                <div className="profile-field">
                  <label>Фамилия</label>
                  <input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="profile-field">
                <label>Телефон</label>
                <input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
              <button
                className="profile-btn profile-btn--primary"
                onClick={handleProfileSave}
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>

          <div className="profile-side">
            <div className="profile-card">
              <h3 className="profile-card__title">Сменить пароль</h3>
              <div className="profile-form">
                <div className="profile-field">
                  <label>Текущий пароль</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                  />
                </div>
                <div className="profile-field">
                  <label>Новый пароль</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                  />
                </div>
                <div className="profile-field">
                  <label>Подтвердить пароль</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>
                {passwordError && <div className="profile-error">{passwordError}</div>}
                <button
                  className="profile-btn"
                  onClick={handlePasswordChange}
                  disabled={
                    changingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {changingPassword ? 'Изменение...' : 'Сменить пароль'}
                </button>
              </div>
            </div>

            <div className="profile-card profile-card--danger">
              <h3 className="profile-card__title profile-card__title--danger">Сбросить настройки</h3>
              <p className="profile-card__desc">
                Сбрасывает корзину, список избранного и настройки каталога. Это действие необратимо.
              </p>
              <button
                className="profile-btn profile-btn--danger"
                onClick={() => setResetConfirmOpen(true)}
              >
                Сбросить все настройки
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Сбросить настройки"
        message="Вы уверены? Корзина, список избранного и настройки каталога будут удалены. Это действие необратимо."
        onConfirm={handleResetSettings}
        onCancel={() => setResetConfirmOpen(false)}
        severity="error"
        confirmLabel="Сбросить"
      />
    </div>
  );
}
