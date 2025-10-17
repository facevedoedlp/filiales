import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { accionesApi } from '../api/acciones.js';

export const useAcciones = (params = {}) =>
  useQuery({
    queryKey: ['acciones', params],
    queryFn: () => accionesApi.getAll(params),
    keepPreviousData: true,
  });

export const useAccion = (id) =>
  useQuery({
    queryKey: ['accion', id],
    queryFn: () => accionesApi.getById(id),
    enabled: Boolean(id),
  });

export const useCreateAccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accionesApi.create,
    onSuccess: () => {
      toast.success('Acción registrada');
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al registrar acción');
    },
  });
};

export const useUpdateAccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => accionesApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Acción actualizada');
      queryClient.invalidateQueries({ queryKey: ['accion', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar acción');
    },
  });
};

export const useDeleteAccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accionesApi.delete,
    onSuccess: () => {
      toast.success('Acción eliminada');
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar acción');
    },
  });
};
