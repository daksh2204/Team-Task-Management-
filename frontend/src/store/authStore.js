import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password });
        set({ user: data, token: data.token });
      },

      signup: async (name, email, password, role) => {
        const { data } = await api.post('/api/auth/signup', { name, email, password, role });
        set({ user: data, token: data.token });
      },

      logout: () => {
        set({ user: null, token: null });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
