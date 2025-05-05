import { Link, useNavigate } from 'react-router-dom';

export function ZonesReciclatgeCard({ zones }) {
  const navigate = useNavigate();

  const handleDivClick = () => {
    // Solo navega a la zona cuando no se hace clic en el enlace
    navigate(`/zona/${zones.id}`);
  };

  const handleLinkClick = (e) => {
    // Evita que el click en el Link propague el evento hacia el div
    e.stopPropagation();
  };

  return (
    <div
      className="bg-zinc-800 p-4 rounded-lg shadow-md hover:bg-zinc-700 hover:shadow-lg transition-all duration-200 cursor-pointer border border-zinc-700"
      onClick={handleDivClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h2 className="text-lg font-bold text-white mb-1">{zones.nom}</h2>
          <p className="text-gray-400 text-sm mb-3">{zones.ciutat}</p>
        </div>
        
        <Link
          to={`/zones/${zones.id}/contenedores`}
          className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors mt-2 w-full"
          onClick={handleLinkClick}
        >
          Gestionar contenedores
        </Link>
      </div>
    </div>
  );
}

