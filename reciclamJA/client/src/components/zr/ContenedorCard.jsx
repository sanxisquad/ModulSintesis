import { useNavigate } from "react-router-dom";

export function ContenedorCard({ contenedor }) {
    const navigate = useNavigate();
  
    const getColor = (estat) => {
      switch (estat) {
        case 'buit': return 'bg-green-500';
        case 'mig': return 'bg-yellow-500';
        case 'ple': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };
  
    const getStatusText = (estat) => {
      switch (estat) {
        case 'buit': return 'Buit';
        case 'mig': return 'Mig';
        case 'ple': return 'Ple';
        default: return 'Desconegut';
      }
    };
  
    return (
      <div
        className="bg-zinc-800 p-4 rounded-lg shadow-md hover:bg-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer border border-zinc-700"
        onClick={() => navigate(`/contenedor/${contenedor.id}`)}
      >
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-white">{contenedor.cod}</h2>
          <span 
            className={`${getColor(contenedor.estat)} text-white text-xs font-medium px-2 py-1 rounded-full`}
          >
            {getStatusText(contenedor.estat)}
          </span>
        </div>
        
        <div className="flex items-center mt-2">
          <span className="text-gray-400 text-sm">
            {contenedor.tipus}
          </span>
        </div>
      </div>
    );
  }