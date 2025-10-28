import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as accionesAPI from '../api/acciones';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

export const useAcciones = (filters = {}) => {
  const queryClient = useQueryClient();

  const accionesQuery = useQuery({
    queryKey: ['acciones', filters],
    queryFn: () => accionesAPI.getAll(filters),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: accionesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      toast.success('Acción registrada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo registrar la acción';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? accionesAPI.patch(id, data) : accionesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['accion', variables.id] });
      }
      toast.success('Acción actualizada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar la acción';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accionesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      toast.success('Acción eliminada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar la acción';
      toast.error(message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) => accionesAPI.uploadImage(id, formData),
    onSuccess: (_, variables) => {
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['accion', variables.id] });
      }
      toast.success('Imagen subida correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo subir la imagen';
      toast.error(message);
    },
  });

  const results = extractResults(accionesQuery.data);

  return {
    data: accionesQuery.data,
    acciones: results,
    pagination: {
      count: accionesQuery.data?.conteo ?? accionesQuery.data?.count ?? results.length,
      next: accionesQuery.data?.siguiente ?? accionesQuery.data?.next ?? null,
      previous: accionesQuery.data?.anterior ?? accionesQuery.data?.previous ?? null,
    },
    isLoading: accionesQuery.isLoading,
    isError: accionesQuery.isError,
    error: accionesQuery.error,
    refetch: accionesQuery.refetch,
    createAccion: createMutation.mutateAsync,
    updateAccion: updateMutation.mutateAsync,
    deleteAccion: deleteMutation.mutateAsync,
    uploadImagen: uploadMutation.mutateAsync,
  };
};

export const useAccion = (id) =>
  useQuery({
    queryKey: ['accion', id],
    queryFn: () => accionesAPI.getById(id),
    enabled: Boolean(id),
  });
