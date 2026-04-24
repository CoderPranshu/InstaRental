import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
instance.interceptors.request.use(
  (config) => {
    const persisted = localStorage.getItem('persist:root');
    if (persisted) {
      try {
        const root = JSON.parse(persisted);
        const auth = JSON.parse(root.auth);
        if (auth?.user?.token) {
          config.headers.Authorization = `Bearer ${auth.user.token}`;
        }
      } catch (_) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
