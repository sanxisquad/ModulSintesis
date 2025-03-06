import axios from 'axios';

const userApi = axios.create({
    baseURL: 'http://localhost:8000/auth/api/v1/',
});

export const getAllUsers = (user) => {
    return userApi.get('/users/', user);
};
export const getUser = (id) => taskApi.get(`/users/${id}/`);
export const createUser = (user) => taskApi.post('/users/', user);
export const updateUser = (id, user) => taskApi.put(`/users/${id}/`, user);
export const deleteUser = (id) => taskApi.delete(`/users/${id}/`);