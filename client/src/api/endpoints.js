import api from './client';

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data.user ?? r.data),
  updateProfile: (data) => api.put('/profile', data).then((r) => r.data.user ?? r.data),
  changePassword: (data) => api.put('/profile/password', data).then((r) => r.data),
};

// ── Products ──────────────────────────────────────────────────
export const productsApi = {
  list: (params) =>
    api.get('/products', { params }).then((r) => {
      const d = r.data;
      return {
        data: d.products ?? d.data ?? [],
        total: d.total ?? 0,
        page: d.page ?? 1,
        limit: d.limit ?? 20,
        totalPages: d.totalPages ?? 1,
      };
    }),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data.product ?? r.data),
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

// ── Categories ────────────────────────────────────────────────
export const categoriesApi = {
  list: () =>
    api.get('/categories').then((r) => {
      const d = r.data;
      return d.categories ?? d.data ?? d ?? [];
    }),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

// ── Orders ────────────────────────────────────────────────────
export const ordersApi = {
  list: (params) =>
    api.get('/orders', { params }).then((r) => {
      const d = r.data;
      return {
        data: d.orders ?? d.data ?? [],
        total: d.total ?? 0,
        page: d.page ?? 1,
        limit: d.limit ?? 20,
        totalPages: d.totalPages ?? 1,
      };
    }),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (data) => api.post('/orders', data).then((r) => r.data),
  cancel: (id) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }).then((r) => r.data),
};

// ── Favorites (server, if needed) ─────────────────────────────
export const favoritesApi = {
  list: () => api.get('/favorites').then((r) => r.data),
  add: (productId) => api.post('/favorites', { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/favorites/${productId}`).then((r) => r.data),
};

// ── Reviews ───────────────────────────────────────────────────
export const reviewsApi = {
  listForProduct: (productId) => api.get(`/products/${productId}/reviews`).then((r) => r.data),
  add: (productId, data) => api.post(`/products/${productId}/reviews`, data).then((r) => r.data),
  update: (id, data) => api.put(`/reviews/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
};

// ── Users (admin) ─────────────────────────────────────────────
export const usersApi = {
  list: (params) =>
    api.get('/users', { params }).then((r) => {
      const d = r.data;
      return {
        data: d.users ?? d.data ?? [],
        total: d.total ?? 0,
        page: d.page ?? 1,
        limit: d.limit ?? 20,
        totalPages: d.totalPages ?? 1,
      };
    }),
  getById: (id) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

// ── Reports ───────────────────────────────────────────────────
export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard').then((r) => r.data),
  sales: (params) => api.get('/reports/sales', { params }).then((r) => r.data),
  salesBlob: (params) =>
    api.get('/reports/sales', { params, responseType: 'blob' }).then((r) => r.data),
  inventory: (params) => api.get('/reports/inventory', { params }).then((r) => r.data),
  inventoryBlob: (params) =>
    api.get('/reports/inventory', { params, responseType: 'blob' }).then((r) => r.data),
};
