import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as entradasAPI from '../api/entradas';

export const useEntradas = (filters) => {
  const queryClient = useQueryClient();

  const entradasQuery = useQuery({
    queryKey: ['entradas', filters],
    queryFn: () => entradasAPI.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: entradasAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud enviada');
    },
    onError: () => toast.error('Error al enviar la solicitud'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? entradasAPI.patch(id, data) : entradasAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      queryClient.invalidateQueries({ queryKey: ['entrada', variables.id] });
      toast.success('Solicitud actualizada');
    },
    onError: () => toast.error('No se pudo actualizar la solicitud'),
  });

  const deleteMutation = useMutation({
    mutationFn: entradasAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la solicitud'),
  });

  const aprobarMutation = useMutation({
    mutationFn: ({ id, data }) => entradasAPI.aprobar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud aprobada');
    },
    onError: () => toast.error('No se pudo aprobar la solicitud'),
  });

  const rechazarMutation = useMutation({
    mutationFn: ({ id, data }) => entradasAPI.rechazar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud rechazada');
    },
    onError: () => toast.error('No se pudo rechazar la solicitud'),
  });

  return {
    entradas: entradasQuery.data?.results || [],
    meta: entradasQuery.data?.meta,
    isLoading: entradasQuery.isLoading,
    createEntrada: createMutation.mutate,
    updateEntrada: updateMutation.mutate,
    deleteEntrada: deleteMutation.mutate,
    aprobarEntrada: aprobarMutation.mutate,
    rechazarEntrada: rechazarMutation.mutate,
  };
};

export const useEntrada = (id) =>
  useQuery({
    queryKey: ['entrada', id],
    queryFn: () => entradasAPI.getById(id),
    enabled: Boolean(id),
  });
