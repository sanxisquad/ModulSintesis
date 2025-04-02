// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    // Permisos basados en rol
    isSuperAdmin: user?.is_superadmin,
    isAdmin: user?.is_admin,
    isGestor: user?.is_gestor,
    isUser: user?.is_user,
    
    canMenu: user?.is_gestor || user?.is_admin || user?.is_superadmin,
    menuUser: !isAuthenticated || user?.is_user,


    // Permisos específicos
    canDelete: user?.is_admin,
    canEditZR: user?.is_admin || user?.is_gestor,
    canViewDashboard: user?.role !== 'USUARIO_NORMAL',
    
    // Helper para componentes protegidos
    hasRole: (requiredRole) => user?.role === requiredRole
  };
};