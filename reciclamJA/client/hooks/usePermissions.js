// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  const roleCheckers = {
    isSuperAdmin: user?.is_superadmin,
    isAdmin: user?.is_admin,
    isGestor: user?.is_gestor,
    isUser: user?.is_user,
  };

  const hasRole = (requiredRole) => {
    if (roleCheckers.hasOwnProperty(requiredRole)) {
      return roleCheckers[requiredRole];
    }
    
    return user?.role === requiredRole;
  };

  return {
    ...roleCheckers,
    
    canMenu: user?.is_gestor || user?.is_admin || user?.is_superadmin,
    menuUser: !isAuthenticated || user?.is_user,

    canDelete: user?.is_admin,
    canEditZR: user?.is_admin || user?.is_gestor,
    canViewDashboard: user?.role !== 'USUARIO_NORMAL',
    
    hasRole
  };
};