import axios from 'axios';
import apiConfig from './apiClient';

// Create axios instance
const api = axios.create({
  baseURL: apiConfig.getBaseUrl(),
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
  return api.get('/api/premios/');
};

// Get prize details
export const getPrizeById = (id) => {
  return api.get(`/api/premios/${id}/`);
};

// Redeem a prize
export const redeemPrize = (id) => {
  return api.post(`/api/premios/${id}/redeem/`);
};

// For admins/gestors/superadmins only
export const createPrize = (prizeData) => {
  return api.post('/api/premios/', prizeData);
};

export const updatePrize = (id, prizeData) => {
  return api.put(`/api/premios/${id}/`, prizeData);
};

export const deletePrize = (id) => {
  return api.delete(`/api/premios/${id}/`);
};

// Get user's prize redemptions
export const getUserRedemptions = () => {
  return api.get('/api/premios-redenciones/');
};

// For company managers to get redemptions for their company's prizes
export const getCompanyRedemptions = () => {
  return api.get('/api/premios-redenciones/');
};

// For admins/superadmins to get all redemptions
export const getAllRedemptions = () => {
  return api.get('/api/premios-redenciones/?all=true');
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
  getAllRedemptions
};
