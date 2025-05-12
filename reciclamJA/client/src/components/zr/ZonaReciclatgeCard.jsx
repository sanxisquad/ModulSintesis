import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Settings } from 'lucide-react';

export function ZonesReciclatgeCard({ zones }) {
  const navigate = useNavigate();

  // Obtén el número de contenedores directamente de la API
  const numContenedores = zones.num_contenedores || 0;

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
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer relative"
      onClick={handleDivClick}
    >
      {/* Color indicator strip at the top of the card */}
      <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-lg bg-blue-500"></div>
      
      <div className="flex justify-between items-start mb-3 mt-1">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-800">{zones.nom}</h2>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{zones.ciutat || 'Sense ubicació'}</span>
            </div>
          </div>
        </div>
        
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          {numContenedores} {numContenedores === 1 ? 'contenidor' : 'contenidors'}
        </span>
      </div>
      
      <div className="flex mt-4 space-x-2">
        <Link
          to={`/zona/${zones.id}`}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
          onClick={handleLinkClick}
        >
          Detalls
        </Link>
        
        <Link
          to={`/zones/${zones.id}/contenedores`}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
          onClick={handleLinkClick}
        >
          <Settings className="h-4 w-4 mr-2" />
          Gestionar
        </Link>
      </div>
    </div>
  );
}

