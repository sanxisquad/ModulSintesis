import {useNavigate} from "react-router-dom";
export function UserCard({user}) {

    const navigate = useNavigate();
    return (

        <div
            className="bg-zinc-800 p3 rounded hover:bg-zinc-700 hover:cursor-pointer"
            onClick={() => navigate(`/users/${user.id}`)}
        >
            <h1 className="font-bold uppercase">{user.first_name}</h1>
            <p className="text-slate-400">{user.last_name}</p>
        </div>

    )
}

