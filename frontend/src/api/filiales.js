import api from './axios';
import { normalizePaginatedResponse } from './utils';

export const getAll = async (params = {}) => {
  const { data } = await api.get('/api/filiales/', { params });
  return normalizePaginatedResponse(data);
};

export const getById = async (id) => {
  const { data } = await api.get(`/api/filiales/${id}/`);
  return data;
};

export const create = async (payload) => {
  const { data } = await api.post('/api/filiales/', payload);
  return data;
};

export const update = async (id, payload) => {
  const { data } = await api.put(`/api/filiales/${id}/`, payload);
  return data;
};

export const patch = async (id, payload) => {
  const { data } = await api.patch(`/api/filiales/${id}/`, payload);
  return data;
};

export const remove = async (id) => {
  const { data } = await api.delete(`/api/filiales/${id}/`);
  return data;
};

export const getMapa = async () => {
  const { data } = await api.get('/api/filiales/mapa/');
  return data;
};
