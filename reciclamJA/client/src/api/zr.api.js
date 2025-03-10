import axios from 'axios';

const zrApi = axios.create({
    baseURL: 'http://localhost:8000/zr/api/v1/zr',
});

export const getAllContenidors = (contenidors) => {
    return zrApi.get('/contenidors/', contenidors);
};
export const getContenidor = (id) => zrApi.get(`/contenidors/${id}/`);
export const createContenidor = (contenidor) => zrApi.post('/contenidors/', contenidor);
export const updateContenidor = (id, contenidor) => zrApi.put(`/contenidors/${id}/`, contenidor);
export const deleteContenidor = (id) => zrApi.delete(`/contenidors/${id}/`);