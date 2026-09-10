import axios from 'axios';

// One shared axios instance, pre-configured with the backend's base URL.
// Every request you make with `api.get(...)` etc. will automatically
// go to http://localhost:4000/api/... — you never repeat that URL again.
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

// This runs before every outgoing request. If we have a saved JWT
// (from login), attach it automatically so protected routes work.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
