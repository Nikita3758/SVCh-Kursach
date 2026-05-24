export const STORAGE_KEYS = {
  TOKEN: 'token',
  CART: 'cart',
  FAVORITES: 'favorites',
  CATALOG_SETTINGS: 'catalogSettings',
};

export function getFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

export function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function resetUserSettings() {
  removeFromStorage(STORAGE_KEYS.CART);
  removeFromStorage(STORAGE_KEYS.FAVORITES);
  removeFromStorage(STORAGE_KEYS.CATALOG_SETTINGS);
}
