import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { filialesApi } from '../api/filiales.js'; // ✅ RUTA CORRECTA

export const useFiliales = (params = {}) =>
  useQuery({
    queryKey: ['filiales', params],
    queryFn: () => filialesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

export const useFilial = (id) =>
  useQuery({
    queryKey: ['filial', id],
    queryFn: () => filialesApi.getById(id),
    enabled: Boolean(id),
  });

export const useFilialEstadisticas = (id) =>
  useQuery({
    queryKey: ['filial', id, 'estadisticas'],
    queryFn: () => filialesApi.getEstadisticas(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateFilial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: filialesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear filial');
    },
  });
};

export const useUpdateFilial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => filialesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      queryClient.invalidateQueries({ queryKey: ['filial', variables.id] });
      toast.success('Filial actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar filial');
    },
  });
};

export const useDeleteFilial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: filialesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial desactivada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desactivar filial');
    },
  });
};

export const useRenovarFilial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => filialesApi.renovar(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filial', variables.id] });
      toast.success('Autoridades renovadas exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al renovar autoridades');
    },
  });
};