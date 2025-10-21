import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

console.log('🌐 API configurada en:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ⬆️ REQUEST Interceptor - Lee el token del localStorage directamente
api.interceptors.request.use(
  (config) => {
    // Leer del localStorage en cada request
    const storageData = localStorage.getItem('auth-storage');
    
    if (storageData) {
      try {
        const parsed = JSON.parse(storageData);
        const token = parsed.state?.token || parsed.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`📤 ${config.method.toUpperCase()} ${config.url} 🔑 (con token)`);
        } else {
          console.log(`📤 ${config.method.toUpperCase()} ${config.url} 🔓 (sin token)`);
        }
      } catch (e) {
        console.error('Error parseando auth-storage:', e);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// ⬇️ RESPONSE Interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error(`❌ ${error.config?.method.toUpperCase()} ${url} - ${status}`);
    
    if (status === 401 && !url?.includes('/auth/login')) {
      console.log('🚫 Token inválido - limpiando sesión');
      localStorage.removeItem('auth-storage');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;