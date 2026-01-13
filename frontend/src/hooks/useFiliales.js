import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as filialesAPI from '../api/filiales';

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) {
      return data[firstKey][0];
    }
    if (firstKey && typeof data[firstKey] === 'string') {
      return data[firstKey];
    }
  }
  return error.response?.data?.detail || fallback;
};

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
      const message = getErrorMessage(error, 'No se pudo crear la filial');
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
      const message = getErrorMessage(error, 'No se pudo actualizar la filial');
      toast.error(message);
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: filialesAPI.deshabilitar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial desactivada');
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'No se pudo desactivar la filial');
      toast.error(message);
    },
  });

  const activarMutation = useMutation({
    mutationFn: filialesAPI.habilitar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial activada');
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'No se pudo activar la filial');
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
    desactivarFilial: desactivarMutation.mutateAsync,
    activarFilial: activarMutation.mutateAsync,
  };
};

export const useFilial = (id) =>
  useQuery({
    queryKey: ['filial', id],
    queryFn: () => filialesAPI.getById(id),
    enabled: Boolean(id),
  });
