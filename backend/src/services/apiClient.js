import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🌐 Configurando API con URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Función para configurar el token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Token configurado en axios');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('❌ Token eliminado de axios');
  }
};

// ⬆️ REQUEST Interceptor
api.interceptors.request.use(
  (config) => {
    const token = config.headers['Authorization'];
    
    if (token) {
      console.log('📤 Request con token:', config.method.toUpperCase(), config.url);
    } else {
      console.log('📤 Request SIN token:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ⬇️ RESPONSE Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitoso:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ Error response:', status, url, error.response?.data);
    
    if (status === 401 && !url?.includes('/auth/login')) {
      console.log('🚫 Token inválido, limpiando auth...');
      
      // Importación dinámica para evitar circular dependency
      import('../store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;