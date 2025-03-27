import {useNavigate} from "react-router-dom";
import { usePermissions } from "../../../hooks/usePermissions";

export function UserCard({user}) {
    const { isSuperAdmin } = usePermissions();

    const navigate = useNavigate();
    return (

        <div
            className=" bg-zinc-800 p3 rounded hover:bg-zinc-700 hover:cursor-pointer"
            onClick={() => navigate(`/users/${user.id}`)}
        >
            <h1 className="font-bold uppercase">{user.first_name} {user.last_name}</h1>
            <p className="text-slate-200">{user.role.name}</p>
            {isSuperAdmin && (
                <p className="text-slate-400">
                    {user.empresa?.nom ? user.empresa.nom : ''}
                </p>
            )}
        </div>

    )
}

