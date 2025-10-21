import api from './axios';

export const getCategorias = async () => {
  const { data } = await api.get('/api/foro/categorias/');
  return data;
};

export const createCategoria = async (payload) => {
  const { data } = await api.post('/api/foro/categorias/', payload);
  return data;
};

export const updateCategoria = async (slug, payload, method = 'put') => {
  const { data } = await api[method](`/api/foro/categorias/${slug}/`, payload);
  return data;
};

export const deleteCategoria = async (slug) => {
  const { data } = await api.delete(`/api/foro/categorias/${slug}/`);
  return data;
};

export const getHilos = async (params) => {
  const { data } = await api.get('/api/foro/hilos/', { params });
  return data;
};

export const getHilo = async (id) => {
  const { data } = await api.get(`/api/foro/hilos/${id}/`);
  return data;
};

export const createHilo = async (payload) => {
  const { data } = await api.post('/api/foro/hilos/', payload);
  return data;
};

export const updateHilo = async (id, payload, method = 'put') => {
  const { data } = await api[method](`/api/foro/hilos/${id}/`, payload);
  return data;
};

export const deleteHilo = async (id) => {
  const { data } = await api.delete(`/api/foro/hilos/${id}/`);
  return data;
};

export const toggleHilo = async (id, payload) => {
  const { data } = await api.post(`/api/foro/hilos/${id}/cerrar/`, payload);
  return data;
};

export const getRespuestas = async (params) => {
  const { data } = await api.get('/api/foro/respuestas/', { params });
  return data;
};

export const createRespuesta = async (payload) => {
  const { data } = await api.post('/api/foro/respuestas/', payload);
  return data;
};

export const updateRespuesta = async (id, payload, method = 'put') => {
  const { data } = await api[method](`/api/foro/respuestas/${id}/`, payload);
  return data;
};

export const deleteRespuesta = async (id) => {
  const { data } = await api.delete(`/api/foro/respuestas/${id}/`);
  return data;
};
