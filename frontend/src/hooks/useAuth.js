import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/client.js';
import toast from 'react-hot-toast';

const useAuth = () => {
  const navigate = useNavigate();
  const { token, user, setCredentials, clear } = useAuthStore();

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      setCredentials(data.data.token, data.data.user);
      toast.success('Bienvenido nuevamente');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'No se pudo iniciar sesión');
      throw error;
    }
  };

  const logout = () => {
    clear();
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
