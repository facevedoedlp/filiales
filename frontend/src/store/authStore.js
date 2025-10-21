import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setCredentials: (token, user) => {
        console.log('💾 Guardando credenciales:', { 
          hasToken: !!token, 
          userName: user?.nombre 
        });
        
        set({ token, user });
        
        console.log('✅ Credenciales guardadas en Zustand');
      },
      
      clear: () => {
        console.log('🚪 Limpiando credenciales...');
        set({ token: null, user: null });
        console.log('✅ Credenciales limpiadas');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);