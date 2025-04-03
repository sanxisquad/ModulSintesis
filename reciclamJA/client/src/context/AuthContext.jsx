import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, getUserProfile } from '../api/auth.api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decodedToken = jwtDecode(token);
                const expirationTime = decodedToken.exp * 1000;
                const timeRemaining = expirationTime - Date.now();

                if (timeRemaining < 5 * 60 * 1000) {
                    refreshAccessToken();
                } else {
                    setIsAuthenticated(true);
                    fetchUserProfile();
                }
            } catch (error) {
                console.error("❌ Error al decodificar token:", error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
            if (!refreshToken) {
                console.error("❌ No hay refresh token disponible.");
                logout();
                return;
            }

            console.log("🔄 Intentando refrescar el token...");

            const response = await fetch('/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (!response.ok) {
                console.error("❌ Error al refrescar token");
                logout();
                return;
            }

            const data = await response.json();
            const newAccessToken = data.access;
            const newRefreshToken = data.refresh;

            if (newAccessToken) {
                localStorage.setItem('auth_token', newAccessToken);
                sessionStorage.setItem('auth_token', newAccessToken);
                setIsAuthenticated(true);
            }

            if (newRefreshToken) {
                localStorage.setItem('refresh_token', newRefreshToken);
                sessionStorage.setItem('refresh_token', newRefreshToken);
            }

            console.log("✅ Token refrescado correctamente");
        } catch (error) {
            console.error("❌ Error en la renovación del token:", error);
            logout();
        }
    };

    const fetchUserProfile = async () => {
        try {
          const response = await getUserProfile();
          setUser(response.data); // Actualiza el estado del contexto
          setIsAuthenticated(true);
          return response.data; // Devuelve el usuario para uso inmediato
        } catch (error) {
          console.error("Fetch User Profile Error:", error);
          setIsAuthenticated(false);
          setUser(null);
          throw error;
        }
      };

    const login = async (credentials) => {
        try {
          const response = await loginUser(credentials);
          const accessToken = response.data.access;
          
          if (!accessToken) {
            throw new Error("No access token received");
          }
      
          // Guardar tokens
          if (credentials.rememberMe) {
            localStorage.setItem('auth_token', accessToken);
            localStorage.setItem('refresh_token', response.data.refresh);
          } else {
            sessionStorage.setItem('auth_token', accessToken);
            sessionStorage.setItem('refresh_token', response.data.refresh);
          }
      
          setIsAuthenticated(true);
          
          // Espera explícitamente a que se complete fetchUserProfile
          const userProfile = await fetchUserProfile(); 
          
          // Devuelve el usuario actualizado (no el estado anterior)
          return userProfile; 
        } catch (error) {
          console.error("Login error:", error);
          throw error; // Propaga el error para manejarlo en el UI
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
    
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('refresh_token');
    
            setIsAuthenticated(false);
            setUser(null);
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


