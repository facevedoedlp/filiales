import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { foroApi } from '../api/foro.js';

export const useTemas = (params = {}) =>
  useQuery({
    queryKey: ['foro', 'temas', params],
    queryFn: () => foroApi.getTemas(params),
    keepPreviousData: true,
  });

export const useTema = (id) =>
  useQuery({
    queryKey: ['foro', 'tema', id],
    queryFn: () => foroApi.getTemaById(id),
    enabled: Boolean(id),
  });

export const useCategoriasForo = () =>
  useQuery({
    queryKey: ['foro', 'categorias'],
    queryFn: foroApi.getCategorias,
    staleTime: 10 * 60 * 1000,
  });

export const useEtiquetasForo = () =>
  useQuery({
    queryKey: ['foro', 'etiquetas'],
    queryFn: foroApi.getEtiquetas,
    staleTime: 5 * 60 * 1000,
  });

export const useCrearTema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foroApi.createTema,
    onSuccess: () => {
      toast.success('Tema creado');
      queryClient.invalidateQueries({ queryKey: ['foro', 'temas'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo crear el tema');
    },
  });
};

export const useActualizarTema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => foroApi.updateTema(id, data),
    onSuccess: (_, variables) => {
      toast.success('Tema actualizado');
      queryClient.invalidateQueries({ queryKey: ['foro', 'tema', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'temas'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el tema');
    },
  });
};

export const useEliminarTema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: foroApi.deleteTema,
    onSuccess: () => {
      toast.success('Tema eliminado');
      queryClient.invalidateQueries({ queryKey: ['foro', 'temas'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo eliminar el tema');
    },
  });
};

export const useGestionTema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }) => {
      if (action === 'destacar') return foroApi.destacarTema(id);
      if (action === 'cerrar') return foroApi.cerrarTema(id);
      throw new Error('Acción inválida');
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'destacar' ? 'Tema destacado' : 'Tema cerrado'
      );
      queryClient.invalidateQueries({ queryKey: ['foro', 'tema', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['foro', 'temas'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el tema');
    },
  });
};

export const useCrearRespuesta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => foroApi.responder({ id, data }),
    onSuccess: (_, variables) => {
      toast.success('Respuesta publicada');
      queryClient.invalidateQueries({ queryKey: ['foro', 'tema', variables.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo publicar la respuesta');
    },
  });
};

export const useActualizarRespuesta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, temaId }) => foroApi.updateRespuesta(id, data),
    onSuccess: (_, variables) => {
      toast.success('Respuesta actualizada');
      if (variables.temaId) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'tema', variables.temaId] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar la respuesta');
    },
  });
};

export const useEliminarRespuesta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, temaId }) => foroApi.deleteRespuesta(id),
    onSuccess: (_, variables) => {
      toast.success('Respuesta eliminada');
      if (variables.temaId) {
        queryClient.invalidateQueries({ queryKey: ['foro', 'tema', variables.temaId] });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo eliminar la respuesta');
    },
  });
};
