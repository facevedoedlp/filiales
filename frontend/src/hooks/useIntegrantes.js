import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as integrantesAPI from '../api/integrantes';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

export const useIntegrantes = (filters = {}) => {
  const queryClient = useQueryClient();

  const integrantesQuery = useQuery({
    queryKey: ['integrantes', filters],
    queryFn: () => integrantesAPI.getAll(filters),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: integrantesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante creado correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo crear el integrante';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? integrantesAPI.patch(id, data) : integrantesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      }
      toast.success('Integrante actualizado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar el integrante';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: integrantesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante eliminado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar el integrante';
      toast.error(message);
    },
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, data }) => integrantesAPI.cambiarEstado(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      }
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo cambiar el estado';
      toast.error(message);
    },
  });

  const results = extractResults(integrantesQuery.data);

  return {
    data: integrantesQuery.data,
    integrantes: results,
    pagination: {
      count: integrantesQuery.data?.conteo ?? integrantesQuery.data?.count ?? results.length,
      next: integrantesQuery.data?.siguiente ?? integrantesQuery.data?.next ?? null,
      previous: integrantesQuery.data?.anterior ?? integrantesQuery.data?.previous ?? null,
    },
    isLoading: integrantesQuery.isLoading,
    isError: integrantesQuery.isError,
    error: integrantesQuery.error,
    refetch: integrantesQuery.refetch,
    createIntegrante: createMutation.mutateAsync,
    updateIntegrante: updateMutation.mutateAsync,
    deleteIntegrante: deleteMutation.mutateAsync,
    changeEstado: estadoMutation.mutateAsync,
  };
};

export const useIntegrante = (id) =>
  useQuery({
    queryKey: ['integrante', id],
    queryFn: () => integrantesAPI.getById(id),
    enabled: Boolean(id),
  });
