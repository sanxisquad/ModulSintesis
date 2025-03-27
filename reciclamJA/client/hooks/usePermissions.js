// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    // Permisos basados en rol
    isSuperAdmin: user?.role === 'SUPERADMIN',
    isAdmin: user?.is_admin,
    isGestor: user?.is_gestor,
    
    // Permisos específicos
    canDeleteZR: user?.is_admin,
    canEditZR: user?.is_admin || user?.is_gestor,
    canViewDashboard: user?.role !== 'USUARIO_NORMAL',
    
    // Helper para componentes protegidos
    hasRole: (requiredRole) => user?.role === requiredRole
  };
};