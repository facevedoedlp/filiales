import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificacionesApi } from '../api/notificaciones.js';

export const useNotificaciones = (params = {}) =>
  useQuery({
    queryKey: ['notificaciones', params],
    queryFn: () => notificacionesApi.getAll(params),
    refetchInterval: params?.leida === false ? 60 * 1000 : undefined,
  });

export const useMarcarNotificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificacionesApi.marcarLeida,
    onSuccess: (_, id) => {
      toast.success('Notificación marcada como leída');
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['notificaciones', { leida: false }] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar la notificación');
    },
  });
};

export const useMarcarTodasNotificaciones = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificacionesApi.marcarTodas,
    onSuccess: () => {
      toast.success('Todas las notificaciones marcadas como leídas');
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo marcar como leídas');
    },
  });
};

export const useEliminarNotificacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificacionesApi.eliminar,
    onSuccess: () => {
      toast.success('Notificación eliminada');
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo eliminar la notificación');
    },
  });
};
