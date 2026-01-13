import api from './axios';
import { normalizePaginatedResponse } from './utils';

export const getAll = async (params = {}) => {
  const { data } = await api.get('/api/partidos/', { params });
  return normalizePaginatedResponse(data);
};

export const getById = async (id) => {
  const { data } = await api.get(`/api/partidos/${id}/`);
  return data;
};

export const create = async (payload) => {
  const { data } = await api.post('/api/partidos/', payload);
  return data;
};

export const update = async (id, payload) => {
  const { data } = await api.put(`/api/partidos/${id}/`, payload);
  return data;
};

export const patch = async (id, payload) => {
  const { data } = await api.patch(`/api/partidos/${id}/`, payload);
  return data;
};

export const remove = async (id) => {
  const { data } = await api.delete(`/api/partidos/${id}/`);
  return data;
};
