import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { integrantesApi } from '../api/integrantes.js';

export const useIntegrantes = (params = {}) =>
  useQuery({
    queryKey: ['integrantes', params],
    queryFn: () => integrantesApi.getAll(params),
    keepPreviousData: true,
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
    onSuccess: (_, variables) => {
      toast.success('Integrante creado correctamente');
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      if (variables?.filialId) {
        queryClient.invalidateQueries({ queryKey: ['integrantes', { filialId: variables.filialId }] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear integrante');
    },
  });
};

export const useUpdateIntegrante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => integrantesApi.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Integrante actualizado');
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      if (variables?.data?.filialId) {
        queryClient.invalidateQueries({ queryKey: ['integrantes', { filialId: variables.data.filialId }] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar integrante');
    },
  });
};

export const useToggleIntegrante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }) => (activo ? integrantesApi.activar(id) : integrantesApi.desactivar(id)),
    onSuccess: (_, variables) => {
      toast.success(variables.activo ? 'Integrante activado' : 'Integrante desactivado');
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      if (variables?.filialId) {
        queryClient.invalidateQueries({ queryKey: ['integrantes', { filialId: variables.filialId }] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el integrante');
    },
  });
};
