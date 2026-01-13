// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokens, getAccessToken } from '../api/tokenStorage';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: Boolean(getAccessToken()),

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const hasToken = Boolean(getAccessToken());
        state.isAuthenticated = hasToken;
        if (!hasToken) {
          state.user = null;
        }
      },
    }
  )
);
