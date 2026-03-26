import { create } from 'zustand';
import api from '../services/api';

const useSettingsStore = create((set) => ({
  shopName: 'BoutiquePro',
  logoUrl: null,
  loading: false,
  
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/settings');
      if (data) {
        set({ 
          shopName: data.shop_name || 'BoutiquePro',
          logoUrl: data.logo || null
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      set({ loading: false });
    }
  },
  
  setShopName: (name) => set({ shopName: name }),
  setLogoUrl: (logo) => set({ logoUrl: logo })
}));

export default useSettingsStore;
