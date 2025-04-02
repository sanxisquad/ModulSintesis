// src/hooks/usePermissions.js
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Mapeo de roles a sus propiedades en el user
  const roleCheckers = {
    isSuperAdmin: user?.is_superadmin,
    isAdmin: user?.is_admin,
    isGestor: user?.is_gestor,
    isUser: user?.is_user,
    // Puedes añadir más roles aquí según necesites
  };

  // Función mejorada que verifica tanto por nombre de rol como por flags booleanos
  const hasRole = (requiredRole) => {
    // Si el requiredRole existe como key en roleCheckers, devuelve su valor
    if (roleCheckers.hasOwnProperty(requiredRole)) {
      return roleCheckers[requiredRole];
    }
    
    // Opcional: también puedes verificar por el campo 'role' si lo necesitas
    return user?.role === requiredRole;
  };

  return {
    // Permisos basados en rol (puedes acceder a estos directamente o usar hasRole)
    ...roleCheckers,
    
    // Permisos compuestos
    canMenu: user?.is_gestor || user?.is_admin || user?.is_superadmin,
    menuUser: !isAuthenticated || user?.is_user,

    // Permisos específicos
    canDelete: user?.is_admin,
    canEditZR: user?.is_admin || user?.is_gestor,
    canViewDashboard: user?.role !== 'USUARIO_NORMAL',
    
    // Función mejorada para verificar roles
    hasRole
  };
};