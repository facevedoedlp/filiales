import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as entradasAPI from '../api/entradas';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

export const useEntradas = (filters = {}) => {
  const queryClient = useQueryClient();

  const entradasQuery = useQuery({
    queryKey: ['entradas', filters],
    queryFn: () => entradasAPI.getAll(filters),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: entradasAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud registrada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo registrar la solicitud';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? entradasAPI.patch(id, data) : entradasAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['entrada', variables.id] });
      }
      toast.success('Solicitud actualizada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar la solicitud';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: entradasAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      toast.success('Solicitud eliminada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar la solicitud';
      toast.error(message);
    },
  });

  const aprobarMutation = useMutation({
    mutationFn: ({ id, data }) => entradasAPI.aprobar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['entrada', variables.id] });
      }
      toast.success('Solicitud aprobada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo aprobar la solicitud';
      toast.error(message);
    },
  });

  const rechazarMutation = useMutation({
    mutationFn: ({ id, data }) => entradasAPI.rechazar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['entrada', variables.id] });
      }
      toast.success('Solicitud rechazada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo rechazar la solicitud';
      toast.error(message);
    },
  });

  const results = extractResults(entradasQuery.data);

  return {
    data: entradasQuery.data,
    entradas: results,
    pagination: {
      count: entradasQuery.data?.conteo ?? entradasQuery.data?.count ?? results.length,
      next: entradasQuery.data?.siguiente ?? entradasQuery.data?.next ?? null,
      previous: entradasQuery.data?.anterior ?? entradasQuery.data?.previous ?? null,
    },
    isLoading: entradasQuery.isLoading,
    isError: entradasQuery.isError,
    error: entradasQuery.error,
    refetch: entradasQuery.refetch,
    createEntrada: createMutation.mutateAsync,
    updateEntrada: updateMutation.mutateAsync,
    deleteEntrada: deleteMutation.mutateAsync,
    aprobarEntrada: aprobarMutation.mutateAsync,
    rechazarEntrada: rechazarMutation.mutateAsync,
  };
};

export const useEntrada = (id) =>
  useQuery({
    queryKey: ['entrada', id],
    queryFn: () => entradasAPI.getById(id),
    enabled: Boolean(id),
  });
