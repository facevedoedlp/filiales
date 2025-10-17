import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/client.js';
import toast from 'react-hot-toast';

const useAuth = () => {
  const navigate = useNavigate();
  const { token, user, setCredentials, clear } = useAuthStore();

  const login = async (credentials) => {
    try {
      console.log('🔐 Intentando login...');
      console.log('📍 API Base URL:', api.defaults.baseURL);
      console.log('📧 Email:', credentials.correo);
      
      const { data } = await api.post('/auth/login', credentials);
      
      console.log('✅ Respuesta del servidor:', data);
      
      if (data.success && data.data) {
        setCredentials(data.data.token, data.data.usuario);
        toast.success('Bienvenido nuevamente');
        navigate('/');
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ URL intentada:', error.config?.url);
      console.error('❌ Base URL:', error.config?.baseURL);
      console.error('❌ Respuesta:', error.response);
      
      if (error.response?.status === 404) {
        toast.error('❌ Endpoint no encontrado. Verifica que el backend esté corriendo en puerto 3000');
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('No se pudo iniciar sesión');
      }
      throw error;
    }
  };

  const logout = () => {
    clear();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated: Boolean(token),
  };
};

export default useAuth;
