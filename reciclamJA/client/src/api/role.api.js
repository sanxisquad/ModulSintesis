import axios from 'axios';

const roleApi = axios.create({
    baseURL: 'http://localhost:8000/auth/api/v1/',
});
authApi.interceptors.request.use(
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

export const getAllRoles = () => {
    return roleApi.get('/roles/');
};