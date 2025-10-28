import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as authAPI from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, logout: logoutStore, user, isAuthenticated } = useAuthStore();

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
        toast.success('Bienvenido nuevamente', { id: 'auth-login' });
        queryClient.setQueryData(['me'], currentUser);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        toast.error('Error al cargar datos de usuario', { id: 'auth-login' });
      }
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

  // Query deshabilitado por defecto, solo se activa si hay token Y está autenticado
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authAPI.getCurrentUser,
    enabled: Boolean(localStorage.getItem('access_token')) && isAuthenticated,
    retry: false, // ← IMPORTANTE: No reintentar si falla
    refetchOnWindowFocus: false, // ← No refetch al hacer focus
    staleTime: 5 * 60 * 1000, // 5 minutos
    onSuccess: (data) => {
      setUser(data);
    },
    onError: (error) => {
      console.error('Error en meQuery:', error);
      // Solo hacer logout si es error de autenticación
      if (error.response?.status === 401) {
        logoutStore();
      }
    },
  });

  return {
    user: user || meQuery.data,
    isLoading: loginMutation.isPending || meQuery.isLoading,
    login: loginMutation.mutateAsync, // ← Cambiar a mutateAsync
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};