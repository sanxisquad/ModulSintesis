import axios from 'axios';

const roleApi = axios.create({
    baseURL: 'http://localhost:8000/auth/api/v1/',
});

export const getAllRoles = () => {
    return roleApi.get('/roles/');
};