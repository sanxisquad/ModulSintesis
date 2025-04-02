import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";

export function ProtectedRoute({ allowedRoles, redirectTo = "/unauthorized" }) {
    const { isAuthenticated } = useAuth();
    const { hasRole } = usePermissions();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const hasAccess = allowedRoles?.some(role => hasRole(role));

    if (!hasAccess) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <Outlet />;
}