import {useNavigate} from "react-router-dom";
export function ContenedorCard ({ contenedor }) {

    const navigate = useNavigate();
    return (
        <div
            className="bg-zinc-800 p3 rounded hover:bg-zinc-700 hover:cursor-pointer"
            onClick={() => navigate(`/contenedor/${contenedor.id}`)}
        >
            <h1 className="font-bold uppercase">{contenedor.cod}</h1>
            <p className="text-slate-400">{contenedor.tipus}</p>
        </div>
    )






}