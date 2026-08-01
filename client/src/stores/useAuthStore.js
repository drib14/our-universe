import { create } from 'zustand';
import api from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('pairly_token') || null,
  refreshToken: localStorage.getItem('pairly_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('pairly_token'),
  isLoading: true,

  setAuth: (user, token, refreshToken) => {
    if (token) localStorage.setItem('pairly_token', token);
    if (refreshToken) localStorage.setItem('pairly_refresh_token', refreshToken);

    set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
    connectSocket();
  },

  updateUser: (userData) => {
    set((state) => ({ user: { ...state.user, ...userData } }));
  },

  checkAuth: async () => {
    const token = localStorage.getItem('pairly_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        set({ user: res.data.user || res.data, isAuthenticated: true, isLoading: false });
        connectSocket();
      } else {
        get().logout();
      }
    } catch (err) {
      console.error('Auth verification failed:', err);
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem('pairly_token');
    localStorage.removeItem('pairly_refresh_token');
    disconnectSocket();
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;
