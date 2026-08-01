import { create } from 'zustand';
import api from '../lib/api';

const useCoupleStore = create((set) => ({
  couple: null,
  partner: null,
  isPaired: false,
  isLoading: false,

  fetchCouple: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/couple');
      if (res.success && res.data) {
        const { couple, partner } = res.data;
        set({ couple, partner, isPaired: !!couple, isLoading: false });
      } else {
        set({ couple: null, partner: null, isPaired: false, isLoading: false });
      }
    } catch (err) {
      set({ couple: null, partner: null, isPaired: false, isLoading: false });
    }
  },

  setCoupleData: (couple, partner) => {
    set({ couple, partner, isPaired: !!couple });
  },

  unpair: async () => {
    try {
      await api.delete('/couple/unpair');
      set({ couple: null, partner: null, isPaired: false });
    } catch (err) {
      console.error('Unpair failed:', err);
      throw err;
    }
  },
}));

export default useCoupleStore;
