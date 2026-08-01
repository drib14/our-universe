import axios from 'axios';
import useAuthStore from '../stores/useAuthStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pairly_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh & 401 handling
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('pairly_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data.success && res.data.data.accessToken) {
            const newToken = res.data.data.accessToken;
            localStorage.setItem('pairly_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          useAuthStore.getState().logout();
          return Promise.reject(refreshErr);
        }
      } else {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
