import axios from 'axios';

const authApi = axios.create({
    baseURL: 'http://localhost:8000/auth/api/v1/auth/',
});

export const registerUser = (user) => {
    return authApi.post('/register/', user);
};

export const loginUser = (credentials) => {
    return authApi.post('/login/', credentials);
};

export const getUserProfile = () => {
    return authApi.get('/profile/');
};

export const updateUserProfile = (profile) => {
    return authApi.put('/profile/', profile);
};

export const logoutUser = () => {
    return authApi.post('/logout/');
};