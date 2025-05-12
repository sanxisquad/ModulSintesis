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
            if (credentials.rememberMe) {
                localStorage.setItem('auth_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh); // Guarda el refresh token
                console.log("✅ Token guardado en localStorage:", response.data.access);
            } else {
                sessionStorage.setItem('auth_token', response.data.access);
                sessionStorage.setItem('refresh_token', response.data.refresh); // Guarda el refresh token
                console.log("✅ Token guardado en sessionStorage:", response.data.access);
            }
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

export const logoutUser = async (refreshToken) => {
    try {
        console.log("🔄 Enviando refresh token para logout:", refreshToken);
        await authApi.post('/logout/', { refresh: refreshToken });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('refresh_token');
    } catch (error) {
        console.error("❌ Error en logout:", error.response?.data || error.message);
        throw error;
    }
};

export async function checkEmailExists(email) {
    try {
        const response = await axios.post('/api/check-email', { email });
        return response.data.exists;  // Retorna true si el correo existe, false si no
    } catch (error) {
        console.error("Error al verificar el correo:", error);
        return false;
    }
}