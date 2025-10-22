import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as foroAPI from '../api/foro';

const extractResults = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.resultados || data.results || [];
};

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
      toast.success('Categoría creada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo crear la categoría';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data, method = 'put' }) => foroAPI.updateCategoria(slug, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'categorias'] });
      if (variables?.slug) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'categoria', variables.slug] });
      }
      toast.success('Categoría actualizada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar la categoría';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'categorias'] });
      toast.success('Categoría eliminada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar la categoría';
      toast.error(message);
    },
  });

  return {
    data: categoriasQuery.data,
    categorias: categoriasQuery.data || [],
    isLoading: categoriasQuery.isLoading,
    isError: categoriasQuery.isError,
    error: categoriasQuery.error,
    refetch: categoriasQuery.refetch,
    createCategoria: createMutation.mutateAsync,
    updateCategoria: updateMutation.mutateAsync,
    deleteCategoria: deleteMutation.mutateAsync,
  };
};

export const useHilos = (filters = {}) => {
  const queryClient = useQueryClient();

  const hilosQuery = useQuery({
    queryKey: ['foro', 'hilos', filters],
    queryFn: () => foroAPI.getHilos(filters),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: foroAPI.createHilo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      toast.success('Hilo publicado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo publicar el hilo';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) => foroAPI.updateHilo(id, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', variables.id] });
      }
      toast.success('Hilo actualizado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar el hilo';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteHilo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'hilos'] });
      toast.success('Hilo eliminado');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar el hilo';
      toast.error(message);
    },
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
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo cambiar el estado del hilo';
      toast.error(message);
    },
  });

  const results = extractResults(hilosQuery.data);

  return {
    data: hilosQuery.data,
    hilos: results,
    pagination: {
      count: hilosQuery.data?.conteo ?? hilosQuery.data?.count ?? results.length,
      next: hilosQuery.data?.siguiente ?? hilosQuery.data?.next ?? null,
      previous: hilosQuery.data?.anterior ?? hilosQuery.data?.previous ?? null,
    },
    isLoading: hilosQuery.isLoading,
    isError: hilosQuery.isError,
    error: hilosQuery.error,
    refetch: hilosQuery.refetch,
    createHilo: createMutation.mutateAsync,
    updateHilo: updateMutation.mutateAsync,
    deleteHilo: deleteMutation.mutateAsync,
    toggleHilo: toggleMutation.mutateAsync,
  };
};

export const useHilo = (id) =>
  useQuery({
    queryKey: ['foro', 'hilo', id],
    queryFn: () => foroAPI.getHilo(id),
    enabled: Boolean(id),
  });

export const useRespuestas = (filters = {}) => {
  const queryClient = useQueryClient();

  const respuestasQuery = useQuery({
    queryKey: ['foro', 'respuestas', filters],
    queryFn: () => foroAPI.getRespuestas(filters),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: foroAPI.createRespuesta,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      if (variables?.hilo) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', variables.hilo] });
      }
      toast.success('Respuesta publicada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo publicar la respuesta';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, method = 'put' }) => foroAPI.updateRespuesta(id, data, method),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      if (filters?.hilo) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', filters.hilo] });
      }
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'respuesta', variables.id] });
      }
      toast.success('Respuesta actualizada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo actualizar la respuesta';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: foroAPI.deleteRespuesta,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['foro', 'respuestas'] });
      if (filters?.hilo) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'hilo', filters.hilo] });
      }
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'respuesta', variables.id] });
      }
      toast.success('Respuesta eliminada');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'No se pudo eliminar la respuesta';
      toast.error(message);
    },
  });

  const results = extractResults(respuestasQuery.data);

  return {
    data: respuestasQuery.data,
    respuestas: results,
    pagination: {
      count: respuestasQuery.data?.conteo ?? respuestasQuery.data?.count ?? results.length,
      next: respuestasQuery.data?.siguiente ?? respuestasQuery.data?.next ?? null,
      previous: respuestasQuery.data?.anterior ?? respuestasQuery.data?.previous ?? null,
    },
    isLoading: respuestasQuery.isLoading,
    isError: respuestasQuery.isError,
    error: respuestasQuery.error,
    refetch: respuestasQuery.refetch,
    createRespuesta: createMutation.mutateAsync,
    updateRespuesta: updateMutation.mutateAsync,
    deleteRespuesta: deleteMutation.mutateAsync,
  };
};
