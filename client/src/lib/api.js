import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const baseURL = rawApiUrl.trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: baseURL || undefined,
});

export default api;
