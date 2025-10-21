import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as filialesAPI from '../api/filiales';

export const useFiliales = (filters) => {
  const queryClient = useQueryClient();

  const filialesQuery = useQuery({
    queryKey: ['filiales', filters],
    queryFn: () => filialesAPI.getAll(filters),
  });

  const mapaQuery = useQuery({
    queryKey: ['filiales', 'mapa'],
    queryFn: filialesAPI.getMapa,
  });

  const createMutation = useMutation({
    mutationFn: filialesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial creada exitosamente');
    },
    onError: () => toast.error('Error al crear filial'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, isPatch }) =>
      isPatch ? filialesAPI.patch(id, data) : filialesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      queryClient.invalidateQueries({ queryKey: ['filial', variables.id] });
      toast.success('Filial actualizada');
    },
    onError: () => toast.error('Error al actualizar filial'),
  });

  const deleteMutation = useMutation({
    mutationFn: filialesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['filiales'] });
      toast.success('Filial eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la filial'),
  });

  return {
    filiales: filialesQuery.data?.results || [],
    meta: filialesQuery.data?.meta,
    isLoading: filialesQuery.isLoading,
    error: filialesQuery.error,
    mapaData: mapaQuery.data || [],
    isMapaLoading: mapaQuery.isLoading,
    createFilial: createMutation.mutate,
    updateFilial: updateMutation.mutate,
    deleteFilial: deleteMutation.mutate,
  };
};

export const useFilial = (id) => {
  return useQuery({
    queryKey: ['filial', id],
    queryFn: () => filialesAPI.getById(id),
    enabled: Boolean(id),
  });
};
