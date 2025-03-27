// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    // Permisos basados en rol
    isSuperAdmin: user?.is_superadmin,
    isAdmin: user?.is_admin,
    isGestor: user?.is_gestor,
    
    canMenu: user?.is_gestor || user?.is_admin || user?.is_superadmin,
    // Permisos específicos
    canDelete: user?.is_admin,
    canEditZR: user?.is_admin || user?.is_gestor,
    canViewDashboard: user?.role !== 'USUARIO_NORMAL',
    
    // Helper para componentes protegidos
    hasRole: (requiredRole) => user?.role === requiredRole
  };
};