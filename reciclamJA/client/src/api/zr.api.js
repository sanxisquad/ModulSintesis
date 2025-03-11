import axios from 'axios';

const zrApi = axios.create({
    baseURL: 'http://localhost:8000/zr/api/v1/zr',
});

// 🚀 Interceptor para añadir el token automáticamente
zrApi.interceptors.request.use(
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
export const getAllContenedors = () => zrApi.get('/contenidors/');
export const getContenedor = (id) => zrApi.get(`/contenidors/${id}/`);
export const createContenedor = async (contenedor) => {
    try {
        const response = await zrApi.post('/contenidors/', contenedor);
        return response.data;
    } catch (error) {
        console.error("Error en la solicitud:", error.response?.data || error.message);
        throw error;
    }
};

export const updateContenedor = (id, contenedor) => zrApi.put(`/contenidors/${id}/`, contenedor);
export const deleteContenedor = (id) => zrApi.delete(`/contenidors/${id}/`);
export const getAllZones = () => zrApi.get('/zones/');
