import axios from 'axios';
import apiConfig from './apiClient';

// Create axios instance
const api = axios.create({
  baseURL: `${apiConfig.getBaseUrl()}/api/reciclar`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all available prizes
export const getAllPrizes = () => {
  return api.get('/premios/');
};

// Get prize details
export const getPrizeById = (id) => {
  return api.get(`/premios/${id}/`);
};

// Redeem a prize
export const redeemPrize = (id) => {
  return api.post(`/premios/${id}/redeem/`);
};

// For admins/gestors/superadmins only
export const createPrize = (prizeData) => {
  // Cuando usamos FormData para enviar archivos, NO debemos establecer el Content-Type
  // Axios configurará automáticamente el Content-Type adecuado con el boundary
  const config = {
    headers: {
      // No incluir Content-Type aquí, axios lo configurará automáticamente
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
    }
  };
  
  // Log para depuración
  console.log("FormData prizeData entries:", 
    Array.from(prizeData.entries()).map(([k, v]) => 
      k === 'imagen' ? [k, 'File object'] : [k, v]
    )
  );
  
  // Fixing the URL to match the backend route
  return axios.post(`${apiConfig.getBaseUrl()}/api/reciclar/premios/crear/`, prizeData, config);
};

export const updatePrize = (id, prizeData) => {
  // Similar al anterior, no establecer Content-Type cuando usamos FormData
  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`
    }
  };
  
  return axios.put(`${apiConfig.getBaseUrl()}/api/reciclar/premios/${id}/actualizar/`, prizeData, config);
};

export const deletePrize = (id) => {
  return api.delete(`/premios/${id}/eliminar/`);
};

// Get user's prize redemptions
export const getUserRedemptions = () => {
  return api.get('/premios-redenciones/');
};

// For company managers to get redemptions for their company's prizes
export const getCompanyRedemptions = () => {
  return api.get('/premios-redenciones/');
};

// For admins/superadmins to get all redemptions
export const getAllRedemptions = () => {
  return api.get('/premios-redenciones/?all=true');
};

// Error handling helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error status
    console.error('Error response:', error.response.data);
    return {
      error: true,
      status: error.response.status,
      message: error.response.data.error || error.response.data.detail || 'Error al procesar la solicitud'
    };
  } else if (error.request) {
    // Request was made but no response received
    console.error('No response received:', error.request);
    return {
      error: true,
      status: 0,
      message: 'No se recibió respuesta del servidor'
    };
  } else {
    // Something else caused the error
    console.error('Error:', error.message);
    return {
      error: true,
      message: error.message || 'Error desconocido'
    };
  }
};

export default {
  getAllPrizes,
  getPrizeById,
  redeemPrize,
  createPrize,
  updatePrize,
  deletePrize,
  getUserRedemptions,
  getCompanyRedemptions,
  getAllRedemptions,
  handleApiError
};
