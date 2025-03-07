import axios from 'axios';


const authApi = axios.create({
    baseURL: 'http://localhost:8000/auth/api/v1/auth/',
});

// Interceptor para agregar el token JWT a las solicitudes
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


export const registerUser = (user) => {
    return authApi.post('/register/', user);
};

export const loginUser = async (credentials) => {
    try {
        const response = await authApi.post('/login/', credentials);

        console.log("🔍 Respuesta del backend:", response.data);  // Verifica que el backend envía el token

        if (response.data.access) {
            localStorage.setItem('auth_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh); // Guarda el refresh token
            console.log("✅ Token guardado en localStorage:", response.data.access);
        } else {
            console.error("❌ No se recibió el token de acceso");
        }

        return response;
    } catch (error) {
        console.error("❌ Error en login:", error.response?.data);
        throw error;
    }
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