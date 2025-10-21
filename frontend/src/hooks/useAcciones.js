import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as accionesAPI from '../api/acciones';

export const useAcciones = (filters) => {
  const queryClient = useQueryClient();

  const accionesQuery = useQuery({
    queryKey: ['acciones', filters],
    queryFn: () => accionesAPI.getAll(filters),
  });

  const createMutation = useMutation({
    mutationFn: accionesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      toast.success('Acción registrada');
    },
    onError: () => toast.error('Error al registrar la acción'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) =>
      method === 'patch' ? accionesAPI.patch(id, data) : accionesAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      queryClient.invalidateQueries({ queryKey: ['accion', variables.id] });
      toast.success('Acción actualizada');
    },
    onError: () => toast.error('Error al actualizar la acción'),
  });

  const deleteMutation = useMutation({
    mutationFn: accionesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['acciones'] });
      toast.success('Acción eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la acción'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, formData }) => accionesAPI.uploadImage(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accion'] });
      toast.success('Imagen subida');
    },
    onError: () => toast.error('No se pudo subir la imagen'),
  });

  return {
    acciones: accionesQuery.data?.results || [],
    meta: accionesQuery.data?.meta,
    isLoading: accionesQuery.isLoading,
    createAccion: createMutation.mutate,
    updateAccion: updateMutation.mutate,
    deleteAccion: deleteMutation.mutate,
    uploadImagen: uploadMutation.mutate,
  };
};

export const useAccion = (id) =>
  useQuery({
    queryKey: ['accion', id],
    queryFn: () => accionesAPI.getById(id),
    enabled: Boolean(id),
  });
