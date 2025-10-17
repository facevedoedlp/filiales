import apiClient from './client.js';

export const integrantesApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/integrantes', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/integrantes/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/integrantes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/integrantes/${id}`, data);
    return response.data;
  },

  desactivar: async (id) => {
    const response = await apiClient.put(`/integrantes/${id}/desactivar`);
    return response.data;
  },

  activar: async (id) => {
    const response = await apiClient.put(`/integrantes/${id}/activar`);
    return response.data;
  },
};
