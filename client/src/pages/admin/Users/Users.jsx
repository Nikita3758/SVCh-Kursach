import { useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { usersApi } from '../../../api/endpoints';
import { useNotification } from '../../../context/AppContext';
import DataTable from '../../../components/admin/DataTable/DataTable';
import ConfirmDialog from '../../../components/common/ConfirmDialog/ConfirmDialog';
import { formatDate, getInitials } from '../../../utils/formatters';
import '../../../styles/AdminPages.css';

export default function AdminUsers() {
  const { notifySuccess, notifyError } = useNotification();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: 2,
  });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, refetch } = useFetch(
    () =>
      usersApi.list({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      }),
    [page, rowsPerPage, searchQuery],
  );

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      roleId: user.roleId,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setUpdating(true);
    try {
      await usersApi.update(editingUser.id, editForm);
      notifySuccess('Пользователь обновлён');
      setEditingUser(null);
      refetch();
    } catch {
      notifyError('Ошибка при обновлении');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    try {
      await usersApi.remove(deleteUserId);
      notifySuccess('Пользователь удалён');
      setDeleteUserId(null);
      refetch();
    } catch {
      notifyError('Ошибка при удалении');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      id: 'firstName',
      label: 'Пользователь',
      minWidth: 220,
      render: (_, row) => (
        <div className="admin-user-cell">
          <div className="admin-user-cell__avatar">
            {getInitials(row.firstName, row.lastName)}
          </div>
          <div>
            <div className="admin-user-cell__name">
              {row.firstName} {row.lastName}
            </div>
            <div className="admin-user-cell__email">{row.email}</div>
          </div>
        </div>
      ),
    },
    { id: 'phone', label: 'Телефон', render: (val) => String(val || '—') },
    {
      id: 'role',
      label: 'Роль',
      render: (_, row) => (
        <span className={`badge ${row.role?.name === 'admin' ? 'badge--admin' : 'badge--customer'}`}>
          {row.role?.name === 'admin' ? 'Администратор' : 'Покупатель'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Дата регистрации',
      sortable: true,
      render: (val) => formatDate(String(val)),
    },
    {
      id: 'id',
      label: 'Действия',
      align: 'center',
      render: (_, row) => (
        <div className="admin-actions">
          <button
            className="admin-icon-btn admin-icon-btn--edit"
            onClick={() => handleOpenEdit(row)}
            title="Редактировать"
          >
            ✎
          </button>
          <button
            className="admin-icon-btn admin-icon-btn--delete"
            onClick={() => setDeleteUserId(row.id)}
            title="Удалить"
          >
            ✕
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h1 className="admin-page__title">Управление пользователями</h1>
        <input
          className="admin-search"
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        keyField="id"
        loading={isLoading}
        total={data?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        emptyMessage="Пользователи не найдены"
      />

      {editingUser && (
        <div className="admin-modal">
          <div className="admin-modal__backdrop" onClick={() => setEditingUser(null)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>Редактировать пользователя</h2>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Имя</label>
                    <input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div className="admin-form__field">
                    <label>Фамилия</label>
                    <input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form__field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Телефон</label>
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="admin-form__field">
                    <label>Роль</label>
                    <select
                      value={editForm.roleId}
                      onChange={(e) => setEditForm({ ...editForm, roleId: Number(e.target.value) })}
                    >
                      <option value={2}>Покупатель</option>
                      <option value={1}>Администратор</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn" onClick={() => setEditingUser(null)}>
                Отмена
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleSaveEdit}
                disabled={updating}
              >
                {updating ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteUserId !== null}
        title="Удалить пользователя"
        message="Вы уверены, что хотите удалить этого пользователя? Это действие необратимо."
        onConfirm={handleDelete}
        onCancel={() => setDeleteUserId(null)}
        severity="error"
        loading={deleting}
        confirmLabel="Удалить"
      />
    </div>
  );
}
