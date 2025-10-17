import apiClient from './client.js';

export const foroApi = {
  getTemas: async (params) => {
    const response = await apiClient.get('/foro/temas', { params });
    return response.data;
  },

  getTemaById: async (id) => {
    const response = await apiClient.get(`/foro/temas/${id}`);
    return response.data;
  },

  createTema: async (data) => {
    const response = await apiClient.post('/foro/temas', data);
    return response.data;
  },

  updateTema: async (id, data) => {
    const response = await apiClient.put(`/foro/temas/${id}`, data);
    return response.data;
  },

  deleteTema: async (id) => {
    const response = await apiClient.delete(`/foro/temas/${id}`);
    return response.data;
  },

  destacarTema: async (id) => {
    const response = await apiClient.put(`/foro/temas/${id}/destacar`);
    return response.data;
  },

  cerrarTema: async (id) => {
    const response = await apiClient.put(`/foro/temas/${id}/cerrar`);
    return response.data;
  },

  responder: async ({ id, data }) => {
    const response = await apiClient.post(`/foro/temas/${id}/respuestas`, data);
    return response.data;
  },

  updateRespuesta: async (id, data) => {
    const response = await apiClient.put(`/foro/respuestas/${id}`, data);
    return response.data;
  },

  deleteRespuesta: async (id) => {
    const response = await apiClient.delete(`/foro/respuestas/${id}`);
    return response.data;
  },

  getCategorias: async () => {
    const response = await apiClient.get('/foro/categorias');
    return response.data;
  },

  getEtiquetas: async () => {
    const response = await apiClient.get('/foro/etiquetas');
    return response.data;
  },
};
