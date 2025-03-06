import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, logoutUser, getUserProfile } from '../api/auth.api';
import jwt_decode from 'jwt-decode';  // Si decides usar jwt-decode

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                // Verifica si el token ha expirado
                if (decodedToken.exp < Date.now() / 1000) {
                    localStorage.removeItem('auth_token');  // Elimina el token si ha expirado
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                    fetchUserProfile();
                }
            } catch (error) {
                console.error("Invalid token", error);
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
            localStorage.setItem('auth_token', response.data.token);
            setIsAuthenticated(true);
            fetchUserProfile();
            navigate('/dashboard');
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            // Aquí puedes usar toast para mostrar el error
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

// ✅ Export everything consistently using named exports
export { AuthProvider, AuthContext };

export const useAuth = () => {
    return useContext(AuthContext);
};
