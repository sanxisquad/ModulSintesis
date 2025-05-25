import axios from 'axios';
import apiConfig from './apiClient';

// Crear una instancia de axios para estadísticas
const statsApiClient = axios.create({
  baseURL: apiConfig.getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
statsApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
statsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getTopRecyclers = () => {
  return statsApiClient.get('/api/reciclar/api/stats/top-recyclers/');
};

export const getTopReporters = () => {
  return statsApiClient.get('/api/reciclar/api/stats/top-reporters/');
};

export const getTopContainers = () => {
  return statsApiClient.get('/api/reciclar/api/stats/top-containers/');
};

export const getGeneralStats = () => {
  return statsApiClient.get('/api/reciclar/api/stats/general/');
};
