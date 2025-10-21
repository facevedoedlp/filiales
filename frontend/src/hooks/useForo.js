import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as foroAPI from '../api/foro';

export const useCategorias = () => {
  const queryClient = useQueryClient();

  const categoriasQuery = useQuery({
    queryKey: ['foro', 'categorias'],
    queryFn: foroAPI.getCategorias,
  });

  const createMutation = useMutation({
    mutationFn: foroAPI.createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'categorias'] });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear la categoría'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data, method = 'put' }) => foroAPI.updateCategoria(slug, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'categorias'] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'categoria', variables.slug] });
      toast.success('Categoría actualizada');
    },
    onError: () => toast.error('No se pudo actualizar la categoría'),
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'categorias'] });
      toast.success('Categoría eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la categoría'),
  });

  return {
    categorias: categoriasQuery.data || [],
    isLoading: categoriasQuery.isLoading,
    createCategoria: createMutation.mutate,
    updateCategoria: updateMutation.mutate,
    deleteCategoria: deleteMutation.mutate,
  };
};

export const useHilos = (filters) => {
  const queryClient = useQueryClient();

  const hilosQuery = useQuery({
    queryKey: ['foro', 'hilos', filters],
    queryFn: () => foroAPI.getHilos(filters),
  });

  const createMutation = useMutation({
    mutationFn: foroAPI.createHilo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      toast.success('Hilo creado');
    },
    onError: () => toast.error('No se pudo crear el hilo'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) => foroAPI.updateHilo(id, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', variables.id] });
      toast.success('Hilo actualizado');
    },
    onError: () => toast.error('No se pudo actualizar el hilo'),
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteHilo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      toast.success('Hilo eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el hilo'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }) => foroAPI.toggleHilo(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', variables.id] });
      }
      toast.success('Estado del hilo actualizado');
    },
    onError: () => toast.error('No se pudo actualizar el estado'),
  });

  return {
    hilos: hilosQuery.data?.results || [],
    meta: hilosQuery.data?.meta,
    isLoading: hilosQuery.isLoading,
    createHilo: createMutation.mutate,
    updateHilo: updateMutation.mutate,
    deleteHilo: deleteMutation.mutate,
    toggleHilo: toggleMutation.mutate,
  };
};

export const useHilo = (id) =>
  useQuery({
    queryKey: ['foro', 'hilo', id],
    queryFn: () => foroAPI.getHilo(id),
    enabled: Boolean(id),
  });

export const useRespuestas = (filters) => {
  const queryClient = useQueryClient();

  const respuestasQuery = useQuery({
    queryKey: ['foro', 'respuestas', filters],
    queryFn: () => foroAPI.getRespuestas(filters),
  });

  const createMutation = useMutation({
    mutationFn: foroAPI.createRespuesta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', filters?.hilo] });
      toast.success('Respuesta publicada');
    },
    onError: () => toast.error('No se pudo publicar la respuesta'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) => foroAPI.updateRespuesta(id, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', filters?.hilo] });
      toast.success('Respuesta actualizada');
    },
    onError: () => toast.error('No se pudo actualizar la respuesta'),
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteRespuesta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', filters?.hilo] });
      toast.success('Respuesta eliminada');
    },
    onError: () => toast.error('No se pudo eliminar la respuesta'),
  });

  return {
    respuestas: respuestasQuery.data?.results || [],
    meta: respuestasQuery.data?.meta,
    isLoading: respuestasQuery.isLoading,
    createRespuesta: createMutation.mutate,
    updateRespuesta: updateMutation.mutate,
    deleteRespuesta: deleteMutation.mutate,
  };
};
