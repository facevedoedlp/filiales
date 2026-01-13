import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as authAPI from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { getAccessToken, setTokens } from '../api/tokenStorage';

const normalizeUser = (payload) => {
  if (!payload) return null;
  const baseUser = payload.user ?? payload;
  return {
    ...baseUser,
    rol: payload.rol ?? payload.role ?? baseUser.rol,
    filialId: payload.filialId ?? baseUser.filialId ?? null,
    permisos: payload.permisos ?? baseUser.permisos ?? [],
  };
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setUser, logout: logoutStore, user } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      toast.loading('Ingresando...', { id: 'auth-login' });
    },
    onSuccess: async (data) => {
      setTokens({ access: data.access, refresh: data.refresh });

      try {
        const currentUser = await authAPI.getCurrentUser();
        const normalized = normalizeUser(currentUser);
        if (normalized) {
          setUser(normalized);
        }
        toast.success('Bienvenido nuevamente', { id: 'auth-login' });
        queryClient.setQueryData(['me'], currentUser);
      } catch (error) {
        console.error('Error al obtener usuario:', error);
        toast.error('Error al cargar datos de usuario', { id: 'auth-login' });
      }
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Credenciales invalidas';
      toast.error(message, { id: 'auth-login' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      toast.success('Sesion finalizada');
    },
  });

  // Query deshabilitado por defecto, solo se activa si hay token
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authAPI.getCurrentUser,
    enabled: Boolean(getAccessToken()),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      const normalized = normalizeUser(data);
      if (normalized) {
        setUser(normalized);
      }
    },
    onError: (error) => {
      console.error('Error en meQuery:', error);
      // Solo hacer logout si es error de autenticacion
      if (error.response?.status === 401 || error.response?.status === 403) {
        logoutStore();
      }
    },
  });

  return {
    user: user || meQuery.data,
    isLoading: loginMutation.isPending || meQuery.isLoading,
    login: loginMutation.mutateAsync,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
};
