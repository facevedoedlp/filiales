import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as authAPI from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, logout: logoutStore, user } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      toast.loading('Ingresando...', { id: 'auth-login' });
    },
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      try {
        const currentUser = await authAPI.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('No se pudo obtener el usuario actual', error);
      }
      toast.success('Bienvenido nuevamente', { id: 'auth-login' });
      queryClient.invalidateQueries(['me']);
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Credenciales inválidas';
      toast.error(message, { id: 'auth-login' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Sesión finalizada');
    },
  });

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authAPI.getCurrentUser,
    enabled: Boolean(localStorage.getItem('access_token')),
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      logoutStore();
    },
  });

  return {
    user: meQuery.data || user,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutate,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isLoading,
  };
};
