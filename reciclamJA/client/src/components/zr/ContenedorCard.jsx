import { useNavigate } from "react-router-dom";
import { Trash2, MapPin, AlertTriangle } from "lucide-react";

export function ContenedorCard({ contenedor }) {
    const navigate = useNavigate();
  
    const getColor = (estat) => {
      switch (estat) {
        case 'buit': return 'bg-green-100 text-green-800 border-green-200';
        case 'mig': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'ple': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    const getIconColor = (estat) => {
      switch (estat) {
        case 'buit': return 'text-green-500';
        case 'mig': return 'text-yellow-500';
        case 'ple': return 'text-red-500';
        default: return 'text-gray-500';
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

    const getTipusColor = (tipus) => {
      switch (tipus) {
        case 'paper': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'plàstic': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'vidre': return 'bg-green-100 text-green-800 border-green-200';
        case 'orgànic': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'rebuig': 
        case 'indiferenciat': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };
    
    // New function to get the background color for the state indicator strip
    const getStateBgColor = (estat) => {
      switch (estat) {
        case 'buit': return 'bg-green-500';
        case 'mig': return 'bg-yellow-500';
        case 'ple': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };
  
    // New function to get the background color for the type indicator
    const getTipusBgColor = (tipus) => {
      switch (tipus) {
        case 'paper': return 'bg-blue-500';
        case 'plàstic': return 'bg-yellow-500';
        case 'vidre': return 'bg-green-500';
        case 'orgànic': return 'bg-amber-500';
        case 'rebuig': 
        case 'indiferenciat': return 'bg-gray-500';
        default: return 'bg-gray-500';
      }
    };
  
    return (
      <div
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer relative"
        onClick={() => navigate(`/contenedor/${contenedor.id}`)}
      >
        {/* Color indicator strip at the top of the card - now based on state */}
        <div 
          className={`absolute top-0 left-0 w-full h-1.5 rounded-t-lg ${getStateBgColor(contenedor.estat)}`}
        ></div>
        
        <div className="flex justify-between items-start mb-3 mt-1">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getIconColor(contenedor.estat)}`}>
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-bold text-gray-800">{contenedor.cod}</h2>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{contenedor.ciutat || 'Sense ubicació'}</span>
              </div>
            </div>
          </div>
          
          <span 
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getColor(contenedor.estat)}`}
          >
            {getStatusText(contenedor.estat)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Colored circle indicator for container type */}
            <div className={`w-3 h-3 rounded-full mr-1.5 ${getTipusBgColor(contenedor.tipus)}`}></div>
            <span 
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${getTipusColor(contenedor.tipus)}`}
            >
              {contenedor.tipus}
            </span>
          </div>
          
          {contenedor.alerta && (
            <span className="flex items-center text-red-500 text-xs font-medium">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Alerta
            </span>
          )}
        </div>
      </div>
    );
}