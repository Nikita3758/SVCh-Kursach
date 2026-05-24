import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  STORAGE_KEYS,
  getFromStorage,
  setToStorage,
  removeFromStorage,
} from '../utils/localStorage';
import { authApi } from '../api/endpoints';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getFromStorage(STORAGE_KEYS.TOKEN, null));
  const [authLoading, setAuthLoading] = useState(false);

  // ── Cart ────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState(() => getFromStorage(STORAGE_KEYS.CART, []));

  // ── Favorites ───────────────────────────────────────────
  const [favoriteIds, setFavoriteIds] = useState(() =>
    getFromStorage(STORAGE_KEYS.FAVORITES, []),
  );

  // ── Notifications ───────────────────────────────────────
  const [notification, setNotification] = useState({
    message: '',
    severity: 'info',
    open: false,
  });

  // ── Catalog filters (persisted) ─────────────────────────
  const [catalogSettings, setCatalogSettings] = useState(() => {
    const stored = getFromStorage(STORAGE_KEYS.CATALOG_SETTINGS, null);
    return stored || { filters: {}, sort: 'newest' };
  });

  // Persist cart
  useEffect(() => {
    setToStorage(STORAGE_KEYS.CART, cartItems);
  }, [cartItems]);

  // Persist favorites
  useEffect(() => {
    setToStorage(STORAGE_KEYS.FAVORITES, favoriteIds);
  }, [favoriteIds]);

  // Persist catalog settings
  useEffect(() => {
    setToStorage(STORAGE_KEYS.CATALOG_SETTINGS, catalogSettings);
  }, [catalogSettings]);

  // Auto-load /me on mount if token exists
  useEffect(() => {
    if (token && !user) {
      setAuthLoading(true);
      authApi
        .getMe()
        .then((me) => setUser(me))
        .catch(() => {
          setToken(null);
          setUser(null);
          removeFromStorage(STORAGE_KEYS.TOKEN);
        })
        .finally(() => setAuthLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth actions ────────────────────────────────────────
  const setCredentials = useCallback((userObj, tokenStr) => {
    setUser(userObj);
    setToken(tokenStr);
    setToStorage(STORAGE_KEYS.TOKEN, tokenStr);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setCartItems([]);
    removeFromStorage(STORAGE_KEYS.TOKEN);
  }, []);

  // ── Cart actions ────────────────────────────────────────
  const addCartItem = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateCartItemQuantity = useCallback((productId, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    });
  }, []);

  const removeCartItem = useCallback((productId) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  // ── Favorites actions ───────────────────────────────────
  const addFavorite = useCallback((productId) => {
    setFavoriteIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  }, []);

  const removeFavorite = useCallback((productId) => {
    setFavoriteIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isFavorite = useCallback(
    (productId) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  // ── Notification actions ────────────────────────────────
  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ message, severity, open: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const notifySuccess = useCallback((msg) => showNotification(msg, 'success'), [showNotification]);
  const notifyError = useCallback((msg) => showNotification(msg, 'error'), [showNotification]);
  const notifyInfo = useCallback((msg) => showNotification(msg, 'info'), [showNotification]);
  const notifyWarning = useCallback((msg) => showNotification(msg, 'warning'), [showNotification]);

  // ── Catalog actions ─────────────────────────────────────
  const setFilters = useCallback((filters) => {
    setCatalogSettings((prev) => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  const setSort = useCallback((sort) => {
    setCatalogSettings((prev) => ({ ...prev, sort }));
  }, []);

  const resetFilters = useCallback(() => {
    setCatalogSettings({ filters: {}, sort: 'newest' });
    removeFromStorage(STORAGE_KEYS.CATALOG_SETTINGS);
  }, []);

  const value = {
    // auth
    user,
    token,
    authLoading,
    setCredentials,
    setUser,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role?.name === 'admin' || user?.roleId === 1,
    // cart
    cartItems,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartTotal: cartItems.reduce((sum, i) => sum + Number(i.price || 0) * i.quantity, 0),
    cartCount: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    // favorites
    favoriteIds,
    addFavorite,
    removeFavorite,
    isFavorite,
    // notifications
    notification,
    showNotification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    // catalog
    filters: catalogSettings.filters,
    sort: catalogSettings.sort,
    setFilters,
    setSort,
    resetFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Convenience hooks (split for ergonomics — they all read from the same context)
export const useAuth = () => {
  const { user, token, authLoading, setCredentials, setUser, logout, isAuthenticated, isAdmin } =
    useApp();
  return { user, token, authLoading, setCredentials, setUser, logout, isAuthenticated, isAdmin };
};

export const useCart = () => {
  const {
    cartItems,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartTotal,
    cartCount,
  } = useApp();
  return {
    cartItems,
    addCartItem,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartTotal,
    cartCount,
  };
};

export const useFavorites = () => {
  const { favoriteIds, addFavorite, removeFavorite, isFavorite } = useApp();
  return { favoriteIds, addFavorite, removeFavorite, isFavorite };
};

export const useNotification = () => {
  const {
    notification,
    showNotification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  } = useApp();
  return {
    notification,
    showNotification,
    hideNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
    notify: showNotification,
  };
};

export const useCatalog = () => {
  const { filters, sort, setFilters, setSort, resetFilters } = useApp();
  return { filters, sort, setFilters, setSort, resetFilters };
};
