import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { integrantesApi } from '../api/integrantes.js';

<<<<<<< HEAD
const normalizeIntegrantesParams = (params = {}) => {
  const base = {
    filial_id: params.filial_id ?? params.filialId ?? null,
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    busqueda: params.busqueda ?? params.search ?? '',
    cargo: params.cargo ?? null,
    es_activo: params.es_activo ?? params.esActivo ?? null,
  };

  const queryKeyPayload = {
    filial_id: base.filial_id,
    page: base.page,
    limit: base.limit,
    busqueda: base.busqueda || null,
    cargo: base.cargo,
    es_activo: base.es_activo,
  };

  const requestParams = Object.fromEntries(
    Object.entries(base).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );

  return { queryKeyPayload, requestParams };
};

export const useIntegrantes = (params = {}) => {
  const { queryKeyPayload, requestParams } = normalizeIntegrantesParams(params);

  return useQuery({
    queryKey: ['integrantes', queryKeyPayload],
    queryFn: () => integrantesApi.getAll(requestParams),
=======
export const useIntegrantes = (params = {}, options = {}) =>
  useQuery({
    queryKey: ['integrantes', params],
    queryFn: () => integrantesApi.getAll(params),
    staleTime: 5 * 60 * 1000,
>>>>>>> ad3da76 (cambios ok)
    keepPreviousData: true,
    enabled: true, // Por defecto habilitado
    ...options  // ✅ Permite pasar `enabled: false` desde el componente
  });
};

export const useIntegrante = (id) =>
  useQuery({
    queryKey: ['integrante', id],
    queryFn: () => integrantesApi.getById(id),
    enabled: Boolean(id),
  });

export const useCreateIntegrante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: integrantesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
<<<<<<< HEAD
      if (variables?.filial_id) {
        queryClient.invalidateQueries({
          queryKey: ['integrantes', { filial_id: variables.filial_id }],
        });
      }
=======
      toast.success('Integrante creado exitosamente');
>>>>>>> ad3da76 (cambios ok)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear integrante');
    },
  });
};

export const useUpdateIntegrante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => integrantesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      if (variables?.data?.filial_id) {
        queryClient.invalidateQueries({
          queryKey: ['integrantes', { filial_id: variables.data.filial_id }],
        });
      }
=======
      toast.success('Integrante actualizado exitosamente');
>>>>>>> ad3da76 (cambios ok)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar integrante');
    },
  });
};

export const useToggleIntegrante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }) => integrantesApi.toggle(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrantes'] });
<<<<<<< HEAD
      queryClient.invalidateQueries({ queryKey: ['integrante', variables.id] });
      if (variables?.filial_id) {
        queryClient.invalidateQueries({
          queryKey: ['integrantes', { filial_id: variables.filial_id }],
        });
      }
=======
      toast.success('Estado actualizado');
>>>>>>> ad3da76 (cambios ok)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    },
  });
};