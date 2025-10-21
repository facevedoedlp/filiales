import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { integrantesApi } from '../api/integrantes.js';

export const useIntegrantes = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['integrantes', params],
    queryFn: () => integrantesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    ...options
  });

export const useIntegrante = (id) =>
  useQuery({
    queryKey: ['integrante', id],
    queryFn: () => integrantesApi.getById(id),
    enabled: Boolean(id),
  });

export const useCreateIntegrante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrantesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear integrante');
    },
  });
};

export const useUpdateIntegrante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => integrantesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar integrante');
    },
  });
};

export const useToggleIntegrante = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }) =>
      activo ? integrantesApi.activar(id) : integrantesApi.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    },
  });
};
