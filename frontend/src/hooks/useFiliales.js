import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client.js';
import toast from 'react-hot-toast';

export const FILIALES_QUERY_KEY = ['filiales'];

export const useFiliales = (params) => {
  return useQuery({
    queryKey: [...FILIALES_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get('/filiales', { params });
      return data.data;
    },
  });
};

export const useCreateFilial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/filiales', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILIALES_QUERY_KEY });
      toast.success('Filial creada correctamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'No se pudo crear la filial');
    },
  });
};

export const useUpdateFilial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/filiales/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FILIALES_QUERY_KEY });
      toast.success('Filial actualizada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? 'No se pudo actualizar la filial');
    },
  });
};
