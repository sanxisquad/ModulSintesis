import axios from 'axios';
import apiConfig from './apiClient';

const userApi = axios.create({
    baseURL: apiConfig.getBaseUrls().auth,
});

// 🚀 Interceptor para añadir el token automáticamente (igual que en zrApi)
userApi.interceptors.request.use(
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

// 📌 Métodos para interactuar con la API
export const getAllUsers = () => userApi.get('/users/');
export const getUser = (id) => userApi.get(`/users/${id}/`);
export const createUser = (user) => userApi.post('/users/', user);
export const updateUser = (id, user) => userApi.put(`/users/${id}/`, user);
export const deleteUser = (id) => userApi.delete(`/users/${id}/`);