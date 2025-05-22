import axios from 'axios';
import apiConfig from './apiClient';

// Create authApi with some additional options
const authApi = axios.create({
    baseURL: apiConfig.getBaseUrls().authService,
    // Add some extra options for production
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
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
        // Log the full URL being used
        const loginUrl = `${apiConfig.getBaseUrls().authService}login/`;
        console.log("🔍 Login URL:", loginUrl);
        
        // Make the request directly to ensure correct URL
        const response = await axios.post(loginUrl, credentials, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

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
        console.error("❌ Error en login:", error.response?.data || error.message);
        console.error("Login error: at", error);
        
        // Check specific status codes
        if (error.response?.status === 405) {
            console.error("405 Method Not Allowed - This suggests the URL might be incorrect or the server isn't configured to accept POST requests at this endpoint.");
        }
        
        throw error;
    }
};

export const getUserProfile = () => {
    return authApi.get('/profile/');
};

export const updateUserProfile = async (userData) => {
  try {
    // Usar POST en lugar de PUT/PATCH y asegurarnos que usamos la URL correcta
    // Comprobamos la URL base de authApi para hacer la petición correctamente
    console.log("URL base para autenticación:", apiConfig.getBaseUrls().authService);
    
    // Usar la URL absoluta para asegurar que coincide con el backend
    const response = await axios.post(
      `${apiConfig.getBaseUrls().authService}profile/update/`, 
      userData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Respuesta actualización perfil:", response);
    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    console.error("URL usada:", `${apiConfig.getBaseUrls().authService}profile/update/`);
    throw error;
  }
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

// Request password reset email
export const requestPasswordReset = async (email) => {
  try {
    console.log("[DEBUG] Requesting password reset for email:", email);
    const resetUrl = `${apiConfig.getBaseUrls().authService}accounts/reset-password/request/`;
    console.log("[DEBUG] Reset request URL:", resetUrl);
    
    const response = await axios.post(resetUrl, { email });
    console.log("[DEBUG] Reset request response:", response.data);
    return response;
  } catch (error) {
    console.error("[DEBUG] Password reset request error:", error);
    console.error("[DEBUG] Response data:", error.response?.data);
    console.error("[DEBUG] Status code:", error.response?.status);
    throw error;
  }
};

// Verify reset token
export const verifyResetToken = async (uid, token) => {
  try {
    console.log("[DEBUG] Verifying token:", { uid, token });
    const verifyUrl = `${apiConfig.getBaseUrls().authService}accounts/reset-password/verify/${uid}/${token}/`;
    console.log("[DEBUG] Verification URL:", verifyUrl);
    
    const response = await axios.get(verifyUrl);
    console.log("[DEBUG] Token verification response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[DEBUG] Token verification error:", error);
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (uid, token, newPassword) => {
  try {
    console.log("[DEBUG] Resetting password with token");
    const resetPasswordUrl = `${apiConfig.getBaseUrls().authService}accounts/reset-password/reset/`;
    console.log("[DEBUG] Password reset URL:", resetPasswordUrl);
    
    const response = await axios.post(resetPasswordUrl, {
      uid,
      token,
      new_password: newPassword
    });
    console.log("[DEBUG] Password reset response:", response.data);
    return response;
  } catch (error) {
    console.error("[DEBUG] Password reset error:", error);
    throw error;
  }
};