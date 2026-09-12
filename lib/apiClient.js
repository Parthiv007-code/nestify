import axios from 'axios';

// Since API routes now live in the SAME project (no separate Express server),
// this could even be a relative path like '/api'. Using an env var keeps it
// flexible in case you ever do split the backend out later.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  // localStorage only exists in the browser, not during server-side rendering,
  // so this check prevents a crash if this code ever runs on the server.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
