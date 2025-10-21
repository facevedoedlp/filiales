import api from './axios';

export const getAll = async (params) => {
  const { data } = await api.get('/api/entradas/', { params });
  return data;
};

export const getById = async (id) => {
  const { data } = await api.get(`/api/entradas/${id}/`);
  return data;
};

export const create = async (payload) => {
  const { data } = await api.post('/api/entradas/', payload);
  return data;
};

export const update = async (id, payload) => {
  const { data } = await api.put(`/api/entradas/${id}/`, payload);
  return data;
};

export const patch = async (id, payload) => {
  const { data } = await api.patch(`/api/entradas/${id}/`, payload);
  return data;
};

export const remove = async (id) => {
  const { data } = await api.delete(`/api/entradas/${id}/`);
  return data;
};

export const aprobar = async (id, payload) => {
  const { data } = await api.patch(`/api/entradas/${id}/aprobar/`, payload);
  return data;
};

export const rechazar = async (id, payload) => {
  const { data } = await api.patch(`/api/entradas/${id}/rechazar/`, payload);
  return data;
};
