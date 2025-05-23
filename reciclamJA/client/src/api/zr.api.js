import axios from 'axios';
import apiConfig from './apiClient';

const zrApi = axios.create({
    baseURL: apiConfig.getBaseUrls().zr,
});
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

// Métodos para contenedores (requieren autenticación)
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

// Métodos para zonas (requieren autenticación)
export const getAllZones = () => zrApi.get('/zones/');
export const getZona = (id) => zrApi.get(`/zones/${id}/`);
export const createZona = async (zona) => {
    try {
        const response = await zrApi.post('/zones/', zona);
        return response.data;
    } catch (error) {
        console.error("Error al crear la zona:", error.response?.data || error.message);
        throw error;
    }
};
export const updateZona = (id, zona) => zrApi.put(`/zones/${id}/`, zona);
export const deleteZona = (id) => zrApi.delete(`/zones/${id}/`);
export const assignContenedoresToZona = (zonaId, contenedorIds) => {
    return zrApi.post(`zones/${zonaId}/assign-contenedors/`, {
        contenedor_ids: contenedorIds,
    });
};

// 📌 Métodos PÚBLICOS (no requieren autenticación)
const publicZrApi = axios.create({
    baseURL: apiConfig.getBaseUrls().zr,
});

// Métodos públicos para contenedores
export const getAllPublicContenedors = () => publicZrApi.get('/public/contenidors/');
export const getPublicContenedor = (id) => publicZrApi.get(`/public/contenidors/${id}/`);

// Métodos públicos para zonas
export const getAllPublicZones = () => publicZrApi.get('/public/zones/');
export const getPublicZona = (id) => publicZrApi.get(`/public/zones/${id}/`);

// Métodos para reportes
export const createReporte = async (reporteData, customConfig = {}) => {
    try {
        // Cuando se usa FormData, no es necesario establecer el Content-Type
        // Axios lo configurará automáticamente con el boundary correcto
        const response = await zrApi.post('/reportes/', reporteData);
        return response.data;
    } catch (error) {
        console.error("Error al crear reporte:", error.response?.data || error.message);
        throw error;
    }
};

export const getReportes = () => zrApi.get('/reportes/');
export const getReporte = (id) => zrApi.get(`/reportes/${id}/`);
export const updateReporte = (id, reporteData) => zrApi.put(`/reportes/${id}/`, reporteData);
export const deleteReporte = (id) => zrApi.delete(`/reportes/${id}/`);

// Updated methods for notifications
export const getNotificaciones = () => zrApi.get('/notificaciones/');
export const marcarNotificacionLeida = (id) => zrApi.post(`/notificaciones/${id}/marcar_leida/`);
export const marcarTodasLeidas = () => zrApi.post('/notificaciones/marcar_como_leidas/');

// Métodos específicos para resolución de reportes
export const resolveReporte = (id, comentario) => {
    return zrApi.post(`/reportes/${id}/resolver/`, { comentario });
};

export const rejectReporte = (id, comentario) => {
    return zrApi.post(`/reportes/${id}/rechazar/`, { comentario });
};

// Métodos específicos para procesar reportes
export const processReporte = (id) => {
    return zrApi.post(`/reportes/${id}/procesar/`);
};

// Método para reabrir tickets
export const reopenTicket = (id) => {
    return zrApi.post(`/reportes/${id}/reabrir/`);
};

// Add these functions for ticket comments
export const getComentarios = (reporteId) => zrApi.get(`/reportes/${reporteId}/comentarios/`);

export const addComentario = (reporteId, data) => {
    // Check if data is FormData or plain object
    const headers = data instanceof FormData 
        ? {} // Let axios set the correct content-type for FormData
        : { 'Content-Type': 'application/json' };
        
    // If it's a string, convert to object
    const payload = typeof data === 'string' 
        ? { texto: data } 
        : data;
        
    return zrApi.post(`/reportes/${reporteId}/comentarios/`, payload, { headers });
};

export const deleteComentario = (reporteId, comentarioId) => 
    zrApi.delete(`/reportes/${reporteId}/comentarios/${comentarioId}/`);

// Nuevo método para obtener estadísticas históricas
export const getHistorialStats = (period = 'month', zonaId = 'all') => {
    const params = new URLSearchParams({
        period: period
    });
    
    if (zonaId !== 'all') {
        params.append('zona_id', zonaId);
    }
    
    return zrApi.get(`/historial-stats/?${params.toString()}`);
};