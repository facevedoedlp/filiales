import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { entradasApi } from '../api/entradas.js';

export const usePedidosEntradas = (params = {}) =>
  useQuery({
    queryKey: ['entradas', 'pedidos', params],
    queryFn: () => entradasApi.getPedidos(params),
    keepPreviousData: true,
  });

export const usePedidoEntrada = (id) =>
  useQuery({
    queryKey: ['entradas', 'pedidos', id],
    queryFn: () => entradasApi.getPedidoById(id),
    enabled: Boolean(id),
  });

export const useFixture = (params = {}) =>
  useQuery({
    queryKey: ['entradas', 'fixture', params],
    queryFn: () => entradasApi.getFixture(params),
  });

export const useCrearPedidoEntrada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: entradasApi.createPedido,
    onSuccess: () => {
      toast.success('Solicitud enviada');
      queryClient.invalidateQueries({ queryKey: ['entradas', 'pedidos'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo enviar la solicitud');
    },
  });
};

export const useActualizarPedidoEntrada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => entradasApi.updatePedido(id, data),
    onSuccess: (_, variables) => {
      toast.success('Solicitud actualizada');
      queryClient.invalidateQueries({ queryKey: ['entradas', 'pedidos', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entradas', 'pedidos'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar la solicitud');
    },
  });
};

export const useGestionPedidoEntrada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }) => {
      if (action === 'aprobar') return entradasApi.aprobarPedido(id);
      if (action === 'rechazar') return entradasApi.rechazarPedido(id);
      throw new Error('Acción inválida');
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'aprobar' ? 'Pedido aprobado' : 'Pedido rechazado'
      );
      queryClient.invalidateQueries({ queryKey: ['entradas', 'pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['entradas', 'pedidos', variables.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'No se pudo actualizar el pedido');
    },
  });
};
