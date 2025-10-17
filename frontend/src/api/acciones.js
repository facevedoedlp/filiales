import apiClient from './client.js';

export const accionesApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/acciones', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/acciones/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/acciones', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/acciones/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/acciones/${id}`);
    return response.data;
  },
};
