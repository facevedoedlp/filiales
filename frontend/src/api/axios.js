import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './tokenStorage';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let pendingRequests = [];

const subscribeTokenRefresh = (callback) => {
  pendingRequests.push(callback);
};

const resolvePending = (token) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};
    if (!response || !config) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      config.url?.includes('/api/auth/login') ||
      config.url?.includes('/api/auth/refresh');

    if (response.status === 401 && !config._retry && !isAuthEndpoint) {
      config._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccess) => {
            if (!newAccess) {
              return reject(error);
            }
            config.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(config));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await refreshClient.post('/api/auth/refresh/', {
          refresh: refreshToken,
        });

        setTokens({ access: data.access });
        resolvePending(data.access);
        config.headers.Authorization = `Bearer ${data.access}`;
        return api(config);
      } catch (refreshError) {
        resolvePending(null);
        clearTokens();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (response.status === 401 || (response.status === 403 && !getAccessToken())) {
      clearTokens();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default api;
