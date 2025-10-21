import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as integrantesAPI from '../api/integrantes';

export const useIntegrantes = (filters) => {
  const queryClient = useQueryClient();

  const integrantesQuery = useQuery({
    queryKey: ['integrantes', filters],
    queryFn: () => integrantesAPI.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: integrantesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante creado');
    },
    onError: () => toast.error('Error al crear integrante'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? integrantesAPI.patch(id, data) : integrantesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      toast.success('Integrante actualizado');
    },
    onError: () => toast.error('Error al actualizar integrante'),
  });

  const deleteMutation = useMutation({
    mutationFn: integrantesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Integrante eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el integrante'),
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, data }) => integrantesAPI.cambiarEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('No se pudo actualizar el estado'),
  });

  return {
    integrantes: integrantesQuery.data?.results || [],
    meta: integrantesQuery.data?.meta,
    isLoading: integrantesQuery.isLoading,
    createIntegrante: createMutation.mutate,
    updateIntegrante: updateMutation.mutate,
    deleteIntegrante: deleteMutation.mutate,
    changeEstado: estadoMutation.mutate,
  };
};

export const useIntegrante = (id) =>
  useQuery({
    queryKey: ['integrante', id],
    queryFn: () => integrantesAPI.getById(id),
    enabled: Boolean(id),
  });
