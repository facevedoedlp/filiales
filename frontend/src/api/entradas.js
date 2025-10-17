import apiClient from './client.js';

export const entradasApi = {
  getPedidos: async (params) => {
    const response = await apiClient.get('/entradas/pedidos', { params });
    return response.data;
  },

  getPedidoById: async (id) => {
    const response = await apiClient.get(`/entradas/pedidos/${id}`);
    return response.data;
  },

  createPedido: async (data) => {
    const response = await apiClient.post('/entradas/pedidos', data);
    return response.data;
  },

  updatePedido: async (id, data) => {
    const response = await apiClient.put(`/entradas/pedidos/${id}`, data);
    return response.data;
  },

  aprobarPedido: async (id) => {
    const response = await apiClient.put(`/entradas/pedidos/${id}/aprobar`);
    return response.data;
  },

  rechazarPedido: async (id) => {
    const response = await apiClient.put(`/entradas/pedidos/${id}/rechazar`);
    return response.data;
  },

  getFixture: async (params) => {
    const response = await apiClient.get('/entradas/fixture', { params });
    return response.data;
  },
};
