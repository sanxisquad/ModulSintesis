import axios from 'axios';

const userApi = axios.create({
    baseURL: 'http://localhost:8000/zr/api/v1/',
});

export const getAllUsers = (user) => {
    return userApi.get('/users/', user);
};
export const getUser = (id) => userApi.get(`/users/${id}/`);
export const createUser = (user) => userApi.post('/users/', user);
export const updateUser = (id, user) => userApi.put(`/users/${id}/`, user);
export const deleteUser = (id) => userApi.delete(`/users/${id}/`);