// zr.api.js
import axios from 'axios';

const zrApi = axios.create({
    baseURL: 'http://localhost:8000/zr/api/v1/zr',
});

export const getAllContenedors = (contenidors) => {
    return zrApi.get('/contenidors/', contenidors);
};

export const getContenedor = (id) => zrApi.get(`/contenidors/${id}/`);

export const createContenedor = (contenidor) => zrApi.post('/contenidors/', contenidor);

export const updateContenedor = (id, contenidor) => zrApi.put(`/contenidors/${id}/`, contenidor);

export const deleteContenedor = (id) => zrApi.delete(`/contenidors/${id}/`);

export const getAllZones = () => zrApi.get('/zones/');
