import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, getUserProfile } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode';


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        console.log("🔍 Token al cargar la app:", token);  // Verifica que el token está en localStorage
    
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
    
                if (decodedToken.exp < Date.now() / 1000) {
                    console.warn("⚠️ Token expirado. Eliminando...");
                    localStorage.removeItem('auth_token');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                    fetchUserProfile();
                }
            } catch (error) {
                console.error("❌ Token inválido:", error);
                localStorage.removeItem('auth_token');
                setIsAuthenticated(false);
            }
        }
    }, []);
    

    const fetchUserProfile = async () => {
        try {
            const response = await getUserProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Fetch User Profile Error:", error.response?.data);
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
    
            localStorage.setItem('auth_token', accessToken);
            localStorage.setItem('refresh_token', response.data.refresh); // Guarda el refresh token
    
            console.log("✅ Token guardado en localStorage:", accessToken);
    
            setIsAuthenticated(true);
            await fetchUserProfile();  // 🔄 Recargar datos del usuario
            navigate('/dashboard');
        } catch (error) {
            console.error("❌ Error en login:", error.response?.data);
        }
    };
    

    const logout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error.response?.data);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };

export const useAuth = () => {
    return useContext(AuthContext);
};
