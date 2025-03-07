import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, getUserProfile } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode'; // Importa jwt-decode correctamente

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Estado de carga
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        console.log("🔍 Token al cargar la app:", token);  // Verifica que el token está en localStorage o sessionStorage
    
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
    
                if (decodedToken.exp * 1000 < Date.now()) {
                    console.warn("⚠️ Token expirado. Eliminando...");
                    localStorage.removeItem('auth_token');
                    sessionStorage.removeItem('auth_token');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                    fetchUserProfile();
                }
                
            } catch (error) {
                console.error("❌ Token inválido:", error);
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                setIsAuthenticated(false);
            }
        }
        setLoading(false); // Estado de carga completado
    }, []);
    
    const fetchUserProfile = async () => {
        try {
            const response = await getUserProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Fetch User Profile Error:", error.response?.data || error.message);
            // Si no se pudo obtener el perfil, probablemente el token sea inválido o expirado.
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');  // Redirigir al login
        }
    };

    const login = async (credentials) => {
        try {
            const response = await loginUser(credentials);
            const accessToken = response.data.access;  // ⚠️ Ojo, el backend devuelve 'access', no 'token'
            
            if (!accessToken) {
                console.error("❌ No se recibió el token de acceso");
                return;
            }
    
            if (credentials.rememberMe) {
                localStorage.setItem('auth_token', accessToken);
                localStorage.setItem('refresh_token', response.data.refresh);
            } else {
                sessionStorage.setItem('auth_token', accessToken);
                sessionStorage.setItem('refresh_token', response.data.refresh);
            }
    
            console.log("✅ Token guardado:", accessToken);
            console.log("🔄 Refresh token guardado:", response.data.refresh);
    
            setIsAuthenticated(true);
            await fetchUserProfile();  // 🔄 Recargar datos del usuario
            navigate('/dashboard');
        } catch (error) {
            console.error("❌ Error en login:", error.response?.data);
        }
    };
    
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.error("❌ No se encontró el refresh_token.");
                return;
            }
    
            console.log("🔄 Enviando refresh token para logout:", refreshToken);
    
            await logoutUser(refreshToken);
    
            // Limpiar el almacenamiento
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('refresh_token');
    
            // Actualizar estado de autenticación
            setIsAuthenticated(false);
            setUser(null);
    
            // Redirigir a la página de login
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error?.response?.data || error.message);
        }
    };
    

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };

export const useAuth = () => {
    return useContext(AuthContext);
};