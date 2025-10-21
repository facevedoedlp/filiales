import api from './axios';

export const getGeneral = async () => {
  const { data } = await api.get('/api/dashboard/');
  return data;
};

export const getFilialStats = async (id) => {
  const { data } = await api.get(`/api/dashboard/${id}/filial/`);
  return data;
};

export const getAccionesStats = async () => {
  const { data } = await api.get('/api/dashboard/acciones/estadisticas/');
  return data;
};

export const getEntradasStats = async () => {
  const { data } = await api.get('/api/dashboard/entradas/estadisticas/');
  return data;
};

export const getResumen = async () => {
  const { data } = await api.get('/api/dashboard/resumen/');
  return data;
};
