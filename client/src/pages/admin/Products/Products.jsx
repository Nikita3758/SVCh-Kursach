import { useState } from 'react';
import { useFetch } from '../../../hooks/useFetch';
import { productsApi, categoriesApi } from '../../../api/endpoints';
import { useNotification } from '../../../context/AppContext';
import DataTable from '../../../components/admin/DataTable/DataTable';
import ConfirmDialog from '../../../components/common/ConfirmDialog/ConfirmDialog';
import { formatPrice } from '../../../utils/formatters';
import '../../../styles/AdminPages.css';

const defaultForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  material: '',
  dimensions: '',
  weight: '',
  isActive: true,
  imageUrl: '',
};

export default function AdminProducts() {
  const { notifySuccess, notifyError } = useNotification();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: productsData, isLoading, refetch } = useFetch(
    () =>
      productsApi.list({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      }),
    [page, rowsPerPage, searchQuery],
  );
  const { data: categoriesData } = useFetch(() => categoriesApi.list(), []);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(defaultForm);
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
      material: product.material || '',
      dimensions: product.dimensions || '',
      weight: product.weight ? String(product.weight) : '',
      isActive: product.isActive,
      imageUrl: product.images?.[0]?.url || '',
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Название обязательно';
    if (!formData.description.trim()) errors.description = 'Описание обязательно';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Укажите корректную цену';
    if (formData.stock === '' || Number(formData.stock) < 0) errors.stock = 'Укажите количество';
    if (!formData.categoryId) errors.categoryId = 'Выберите категорию';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const data = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      categoryId: Number(formData.categoryId),
      material: formData.material.trim() || undefined,
      dimensions: formData.dimensions.trim() || undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      isActive: formData.isActive,
      imageUrl: formData.imageUrl.trim() || undefined,
    };
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
        notifySuccess('Товар обновлён');
      } else {
        await productsApi.create(data);
        notifySuccess('Товар создан');
      }
      setDialogOpen(false);
      refetch();
    } catch {
      notifyError('Ошибка при сохранении товара');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    setDeleting(true);
    try {
      await productsApi.remove(deleteProductId);
      notifySuccess('Товар удалён');
      setDeleteProductId(null);
      refetch();
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при удалении';
      notifyError(msg);
      setDeleteProductId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productsApi.update(product.id, { isActive: !product.isActive });
      notifySuccess(`Товар ${!product.isActive ? 'активирован' : 'деактивирован'}`);
      refetch();
    } catch {
      notifyError('Ошибка');
    }
  };

  const columns = [
    {
      id: 'image',
      label: 'Фото',
      render: (_, row) => {
        const img = row.images?.find((i) => i.isMain)?.url || row.images?.[0]?.url;
        return (
          <img
            src={img || `https://picsum.photos/seed/p${row.id}/60/60`}
            alt=""
            className="admin-table__img"
          />
        );
      },
    },
    { id: 'name', label: 'Название', minWidth: 180, sortable: true },
    {
      id: 'category.name',
      label: 'Категория',
      render: (_, row) => row.category?.name || '-',
    },
    {
      id: 'price',
      label: 'Цена',
      align: 'right',
      sortable: true,
      render: (val) => formatPrice(Number(val)),
    },
    {
      id: 'stock',
      label: 'Наличие',
      align: 'right',
      sortable: true,
      render: (val) => {
        const n = Number(val);
        const cls = n === 0 ? 'badge--error' : n < 5 ? 'badge--warn' : 'badge--ok';
        return <span className={`badge ${cls}`}>{n}</span>;
      },
    },
    {
      id: 'isActive',
      label: 'Статус',
      render: (val, row) => (
        <button
          className={`admin-toggle ${val ? 'admin-toggle--on' : 'admin-toggle--off'}`}
          onClick={() => handleToggleActive(row)}
          title={val ? 'Деактивировать' : 'Активировать'}
        >
          {val ? 'Вкл' : 'Выкл'}
        </button>
      ),
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
            onClick={() => setDeleteProductId(row.id)}
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
        <h1 className="admin-page__title">Управление товарами</h1>
        <div className="admin-page__toolbar">
          <input
            className="admin-search"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
          />
          <button className="admin-btn admin-btn--primary" onClick={handleOpenCreate}>
            + Добавить товар
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={productsData?.data || []}
        keyField="id"
        loading={isLoading}
        total={productsData?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => {
          setRowsPerPage(rpp);
          setPage(0);
        }}
        emptyMessage="Товары не найдены"
      />

      {dialogOpen && (
        <div className="admin-modal">
          <div className="admin-modal__backdrop" onClick={() => setDialogOpen(false)} />
          <div className="admin-modal__content">
            <div className="admin-modal__header">
              <h2>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h2>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form">
                <div className="admin-form__row">
                  <div className="admin-form__field admin-form__field--wide">
                    <label>Название *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formErrors.name && <span className="admin-form__error">{formErrors.name}</span>}
                  </div>
                  <div className="admin-form__field">
                    <label>Категория *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">—</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <span className="admin-form__error">{formErrors.categoryId}</span>
                    )}
                  </div>
                </div>
                <div className="admin-form__field">
                  <label>Описание *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {formErrors.description && (
                    <span className="admin-form__error">{formErrors.description}</span>
                  )}
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Цена (Br) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    {formErrors.price && <span className="admin-form__error">{formErrors.price}</span>}
                  </div>
                  <div className="admin-form__field">
                    <label>Количество *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                    {formErrors.stock && <span className="admin-form__error">{formErrors.stock}</span>}
                  </div>
                  <div className="admin-form__field">
                    <label>Материал</label>
                    <input
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__field">
                    <label>Размеры (ДxШxВ)</label>
                    <input
                      placeholder="200x90x80 см"
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    />
                  </div>
                  <div className="admin-form__field">
                    <label>Вес (кг)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form__field">
                  <label>URL изображения</label>
                  <input
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <label className="admin-form__checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Активный (отображается в каталоге)
                </label>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn" onClick={() => setDialogOpen(false)}>
                Отмена
              </button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteProductId !== null}
        title="Удалить товар"
        message="Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить."
        onConfirm={handleDelete}
        onCancel={() => setDeleteProductId(null)}
        severity="error"
        loading={deleting}
        confirmLabel="Удалить"
      />
    </div>
  );
}
