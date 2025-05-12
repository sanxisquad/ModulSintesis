import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

export function ProtectedRoute({ allowedRoles, redirectTo = "/unauthorized" }) {
    const { isAuthenticated, loading, user } = useAuth();
    const { hasRole } = usePermissions();
    const location = useLocation();

    // Estado para rastrear si los permisos están listos
    const [permissionsChecked, setPermissionsChecked] = useState(false);

    useEffect(() => {

        if (!loading && user && typeof hasRole === 'function') {
            setPermissionsChecked(true);
        }
    }, [loading, user, hasRole]);

    // Mostrar carga mientras se verifica la autenticación o permisos
    if (loading || !permissionsChecked) {
        return (
            <div className="flex justify-center items-center h-screen">
                {/* Usa tu componente de carga preferido */}
                <p>Verificando permisos...</p>
            </div>
        );
    }

    // Redirigir si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificar roles permitidos
    const hasAccess = allowedRoles?.some(role => hasRole(role));

    if (!hasAccess) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <Outlet />;
}