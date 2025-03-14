import { useNavigate } from "react-router-dom";
export function ZonesReciclatgeCard({zones}) {
    const navigate = useNavigate();


    return (
        <div
            className="bg-zinc-800 p3 rounded hover:bg-zinc-700 hover:cursor-pointer"
            onClick={() => navigate(`/zona/${zones.id}`)}
        >
            <h1 className="font-bold uppercase">{zones.nom}</h1>

            <p className="text-slate-400">{zones.ciutat}</p>
        </div>
    );
}