import { useState, useEffect } from 'react';
import { TiquetCard } from './TiquetCard';
import { Search } from 'lucide-react';

export function TiquetsList({ tiquets, onTicketStatusChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localTiquets, setLocalTiquets] = useState(tiquets);
  
  // Update local tickets when props change
  useEffect(() => {
    setLocalTiquets(tiquets);
  }, [tiquets]);
  
  // Filtrar tiquets según el término de búsqueda
  const filteredTiquets = searchTerm
    ? localTiquets.filter(tiquet => 
        tiquet.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tiquet.id.toString().includes(searchTerm)
      )
    : localTiquets;
  
  // Manejar la actualización de un tiquet
  const handleUpdateTiquet = (updatedTiquet) => {
    // Update local state immediately
    const updatedTiquets = localTiquets.map(t => 
      t.id === updatedTiquet.id ? updatedTiquet : t
    );
    setLocalTiquets(updatedTiquets);
    
    // Trigger parent component to refresh data from server
    if (onTicketStatusChange) {
      onTicketStatusChange();
    }
  };
  
  return (
    <div className="px-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cerca per descripció o ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Mostrant {filteredTiquets.length} de {localTiquets.length} tiquets
        </div>
      </div>
      
      {filteredTiquets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTiquets.map(tiquet => (
            <TiquetCard 
              key={tiquet.id}
              tiquet={tiquet}
              onUpdateTiquet={handleUpdateTiquet}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No s'han trobat tiquets</p>
          {searchTerm && (
            <button 
              className="mt-4 text-blue-500 hover:text-blue-700"
              onClick={() => setSearchTerm('')}
            >
              Eliminar filtre de cerca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
