import api from './axios';
import { normalizePaginatedResponse } from './utils';

export const getAll = async (params = {}) => {
  const { data } = await api.get('/api/acciones/', { params });
  return normalizePaginatedResponse(data);
};

export const getById = async (id) => {
  const { data } = await api.get(`/api/acciones/${id}/`);
  return data;
};

export const create = async (payload) => {
  const { data } = await api.post('/api/acciones/', payload);
  return data;
};

export const update = async (id, payload) => {
  const { data } = await api.put(`/api/acciones/${id}/`, payload);
  return data;
};

export const patch = async (id, payload) => {
  const { data } = await api.patch(`/api/acciones/${id}/`, payload);
  return data;
};

export const remove = async (id) => {
  const { data } = await api.delete(`/api/acciones/${id}/`);
  return data;
};

export const uploadImage = async (id, formData) => {
  const { data } = await api.post(`/api/acciones/${id}/imagenes/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
