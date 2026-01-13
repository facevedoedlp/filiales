import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as partidosAPI from '../api/partidos';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

export const usePartidos = (filters = {}) => {
  const queryClient = useQueryClient();
  const partidosQuery = useQuery({
    queryKey: ['partidos', filters],
    queryFn: () => partidosAPI.getAll(filters),
    keepPreviousData: true,
  });

  const results = extractResults(partidosQuery.data);

  const createMutation = useMutation({
    mutationFn: partidosAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
      toast.success('Partido creado correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo crear el partido';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? partidosAPI.patch(id, data) : partidosAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['partido', variables.id] });
      }
      toast.success('Partido actualizado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar el partido';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: partidosAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] });
      toast.success('Partido eliminado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar el partido';
      toast.error(message);
    },
  });

  return {
    data: partidosQuery.data,
    partidos: results,
    pagination: {
      count: partidosQuery.data?.conteo ?? partidosQuery.data?.count ?? results.length,
      next: partidosQuery.data?.siguiente ?? partidosQuery.data?.next ?? null,
      previous: partidosQuery.data?.anterior ?? partidosQuery.data?.previous ?? null,
    },
    isLoading: partidosQuery.isLoading,
    isError: partidosQuery.isError,
    error: partidosQuery.error,
    refetch: partidosQuery.refetch,
    createPartido: createMutation.mutateAsync,
    updatePartido: updateMutation.mutateAsync,
    deletePartido: deleteMutation.mutateAsync,
  };
};

export const usePartido = (id) =>
  useQuery({
    queryKey: ['partido', id],
    queryFn: () => partidosAPI.getById(id),
    enabled: Boolean(id),
  });
