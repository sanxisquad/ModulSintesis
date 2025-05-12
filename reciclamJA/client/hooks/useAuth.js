// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext'; // Corrige la ruta al archivo AuthContext.jsx

// Este hook simplifica el uso del contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};