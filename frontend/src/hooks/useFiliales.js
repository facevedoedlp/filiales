import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as filialesAPI from '../api/filiales';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

export const useFiliales = (filters = {}) => {
  const queryClient = useQueryClient();

  const filialesQuery = useQuery({
    queryKey: ['filiales', filters],
    queryFn: () => filialesAPI.getAll(filters),
    keepPreviousData: true,
  });

  const mapaQuery = useQuery({
    queryKey: ['filiales', 'mapa'],
    queryFn: filialesAPI.getMapa,
  });

  const createMutation = useMutation({
    mutationFn: filialesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial creada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo crear la filial';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, isPatch = false }) =>
      isPatch ? filialesAPI.patch(id, data) : filialesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['filial', variables.id] });
      }
      toast.success('Filial actualizada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar la filial';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: filialesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial eliminada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar la filial';
      toast.error(message);
    },
  });

  const results = extractResults(filialesQuery.data);

  return {
    data: filialesQuery.data,
    filiales: results,
    pagination: {
      count: filialesQuery.data?.conteo ?? filialesQuery.data?.count ?? results.length,
      next: filialesQuery.data?.siguiente ?? filialesQuery.data?.next ?? null,
      previous: filialesQuery.data?.anterior ?? filialesQuery.data?.previous ?? null,
    },
    isLoading: filialesQuery.isLoading,
    isError: filialesQuery.isError,
    error: filialesQuery.error,
    refetch: filialesQuery.refetch,
    mapaData: mapaQuery.data || [],
    isMapaLoading: mapaQuery.isLoading,
    createFilial: createMutation.mutateAsync,
    updateFilial: updateMutation.mutateAsync,
    deleteFilial: deleteMutation.mutateAsync,
  };
};

export const useFilial = (id) =>
  useQuery({
    queryKey: ['filial', id],
    queryFn: () => filialesAPI.getById(id),
    enabled: Boolean(id),
  });
