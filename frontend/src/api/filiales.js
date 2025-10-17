import apiClient from './client.js';

export const filialesApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/filiales', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/filiales/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/filiales', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/filiales/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/filiales/${id}`);
    return response.data;
  },

  renovar: async (id, data) => {
    const response = await apiClient.put(`/filiales/${id}/renovar`, data);
    return response.data;
  },

  getEstadisticas: async (id) => {
    const response = await apiClient.get(`/filiales/${id}/estadisticas`);
    return response.data;
  },
};
