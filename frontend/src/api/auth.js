import api from './axios';

export const login = async (credentials) => {
  const { data } = await api.post('/api/auth/login/', credentials);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/api/auth/logout/');
  return data;
};

export const refresh = async (refreshToken) => {
  const { data } = await api.post('/api/auth/refresh/', { refresh: refreshToken });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/api/integrantes/me/');
  return data;
};
