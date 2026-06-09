import axios from 'axios';

const ADMIN_TOKEN_KEY = 'dankov_admin_token';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawApiUrl.trim().replace(/\/+$/, '');

export function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

const api = axios.create({
  baseURL: baseURL || undefined,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;