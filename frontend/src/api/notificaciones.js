import apiClient from './client.js';

export const notificacionesApi = {
  getAll: async (params) => {
    const response = await apiClient.get('/notificaciones', { params });
    return response.data;
  },

  marcarLeida: async (id) => {
    const response = await apiClient.put(`/notificaciones/${id}/leer`);
    return response.data;
  },

  marcarTodas: async () => {
    const response = await apiClient.put('/notificaciones/leer-todas');
    return response.data;
  },

  eliminar: async (id) => {
    const response = await apiClient.delete(`/notificaciones/${id}`);
    return response.data;
  },
};
