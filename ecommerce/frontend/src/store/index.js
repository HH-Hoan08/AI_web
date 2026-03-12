/**
 * Global State Management với Zustand
 * Cart + Auth + UI state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Axios instance với base config
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - thêm JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('luxe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - xử lý lỗi 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

// ===== AUTH STORE =====
export const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    isLoading: false,

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('luxe_token', data.token);
        set({ user: data.data.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (err) {
        set({ isLoading: false });
        return { success: false, message: err.response?.data?.message || 'Đăng nhập thất bại' };
      }
    },

    register: async (userData) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('luxe_token', data.token);
        set({ user: data.data.user, token: data.token, isLoading: false });
        return { success: true };
      } catch (err) {
        set({ isLoading: false });
        return { success: false, message: err.response?.data?.message || 'Đăng ký thất bại' };
      }
    },

    logout: () => {
      localStorage.removeItem('luxe_token');
      api.post('/auth/logout').catch(() => {});
      set({ user: null, token: null });
    },

    updateProfile: async (data) => {
      try {
        const res = await api.patch('/users/profile', data);
        set({ user: res.data.data.user });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.response?.data?.message };
      }
    },

    isAdmin: () => get().user?.role === 'admin',
    isLoggedIn: () => !!get().user
  }),
  { name: 'luxe-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
));

// ===== CART STORE =====
export const useCartStore = create(persist(
  (set, get) => ({
    items: [],

    addItem: (product, quantity = 1, variant = null) => {
      const items = get().items;
      const key = `${product._id}-${variant?.value || 'default'}`;
      const existing = items.find(i => i.key === key);

      if (existing) {
        set({ items: items.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) });
      } else {
        set({ items: [...items, { key, product, quantity, variant, price: product.price }] });
      }
    },

    removeItem: (key) => set({ items: get().items.filter(i => i.key !== key) }),

    updateQuantity: (key, quantity) => {
      if (quantity <= 0) return get().removeItem(key);
      set({ items: get().items.map(i => i.key === key ? { ...i, quantity } : i) });
    },

    clearCart: () => set({ items: [] }),

    // Computed values
    getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    getShippingFee: () => get().getSubtotal() >= 500000 ? 0 : 30000,
    getTotal: () => get().getSubtotal() + get().getShippingFee()
  }),
  { name: 'luxe-cart' }
));

// ===== UI STORE =====
export const useUIStore = create(set => ({
  isCartOpen: false,
  isSearchOpen: false,
  isDarkMode: false,
  isMenuOpen: false,

  toggleCart: () => set(s => ({ isCartOpen: !s.isCartOpen })),
  toggleSearch: () => set(s => ({ isSearchOpen: !s.isSearchOpen })),
  toggleDarkMode: () => set(s => ({ isDarkMode: !s.isDarkMode })),
  toggleMenu: () => set(s => ({ isMenuOpen: !s.isMenuOpen })),
  closeAll: () => set({ isCartOpen: false, isSearchOpen: false, isMenuOpen: false })
}));
