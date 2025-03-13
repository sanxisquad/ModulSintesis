import { useNavigate } from "react-router-dom";

export function ContenedorCard({ contenedor }) {
    const navigate = useNavigate();

    const getColor = (estat) => {
        switch (estat) {
            case 'buit': return 'text-green-500';
            case 'mig': return 'text-yellow-500';
            case 'ple': return 'text-red-500';
            default: return 'text-slate-400';
        }
    };

    return (
        <div
            className="bg-zinc-800 p3 rounded hover:bg-zinc-700 hover:cursor-pointer"
            onClick={() => navigate(`/contenedor/${contenedor.id}`)}
        >
            <h1 className="font-bold uppercase">{contenedor.cod}</h1>
            <p className={`font-bold ${getColor(contenedor.estat)}`}>
                {contenedor.estat}
            </p>
            <p className="text-slate-400">{contenedor.tipus}</p>
        </div>
    );
}
