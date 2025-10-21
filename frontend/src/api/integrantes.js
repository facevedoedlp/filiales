import api from './axios';

export const getAll = async (params) => {
  const { data } = await api.get('/api/integrantes/', { params });
  return data;
};

export const getById = async (id) => {
  const { data } = await api.get(`/api/integrantes/${id}/`);
  return data;
};

export const create = async (payload) => {
  const { data } = await api.post('/api/integrantes/', payload);
  return data;
};

export const update = async (id, payload) => {
  const { data } = await api.put(`/api/integrantes/${id}/`, payload);
  return data;
};

export const patch = async (id, payload) => {
  const { data } = await api.patch(`/api/integrantes/${id}/`, payload);
  return data;
};

export const remove = async (id) => {
  const { data } = await api.delete(`/api/integrantes/${id}/`);
  return data;
};

export const cambiarEstado = async (id, payload) => {
  const { data } = await api.patch(`/api/integrantes/${id}/cambiar_estado/`, payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/integrantes/me/');
  return data;
};
