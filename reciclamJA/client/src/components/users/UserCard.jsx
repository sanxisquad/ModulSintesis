import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermissions";
import { User } from "lucide-react";

export function UserCard({ user }) {
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();

  return (
    <div
      className="bg-white p-4 rounded-md border border-gray-200 hover:shadow-sm transition-all duration-200 hover:cursor-pointer"
      onClick={() => navigate(`/users/${user.id}`)}
    >
      <div className="flex items-center">
        <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center mr-3">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">
            {user.first_name} {user.last_name}
          </h2>
          <div className="flex items-center">
            <div className="bg-green-500 h-2 w-2 rounded-full mr-2"></div>
            <p className="text-sm text-gray-600">
              {user.role?.name || "Sense rol"}
            </p>
          </div>
        </div>
      </div>

      {isSuperAdmin && user.empresa?.nom && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Empresa:</span> {user.empresa.nom}
          </p>
        </div>
      )}
    </div>
  );
}

