import axios from 'axios';
import { apiConfig } from './apiClient';

const roleApi = axios.create({
    baseURL: apiConfig.getBaseUrls().auth,
});
roleApi.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'); // 🔄 Intenta en sessionStorage si no está en localStorage

        console.log("🔍 Token enviado en la solicitud:", token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ No se encontró el token en localStorage ni sessionStorage.");
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export const getAllRoles = async () => {
    try {
        const response = await roleApi.get('/roles/');
        // Ensure we return an array even if the API doesn't return one
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error al obtener roles:", error.message);
        return []; // Return empty array on error
    }
};