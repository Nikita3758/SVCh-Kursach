import axios from 'axios';
import { getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const token = getFromStorage(STORAGE_KEYS.TOKEN, null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
