import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, Building, Flag } from 'lucide-react';
import { getTopContainers } from '../../api/stats.api';

export function TopContainersWidget() {
  const [topContainers, setTopContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopContainers = async () => {
      try {
        const response = await getTopContainers();
        setTopContainers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top containers:", error);
        setError("No s'han pogut carregar les dades");
        setLoading(false);
      }
    };

    fetchTopContainers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 animate-pulse">
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-6 text-red-500">{error}</div>
      </div>
    );
  }

  const getTypeColor = (tipus) => {
    switch (tipus) {
      case 'paper': return 'bg-blue-100 text-blue-800';
      case 'plàstic': return 'bg-yellow-100 text-yellow-800';
      case 'vidre': return 'bg-green-100 text-green-800';
      case 'orgànic': return 'bg-amber-100 text-amber-800';
      case 'rebuig': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Trash2 className="h-5 w-5 text-green-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Contenidors més utilitzats</h2>
      </div>
      
      {topContainers.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No hi ha dades disponibles encara
        </div>
      ) : (
        <div className="space-y-4">
          {topContainers.map((container, index) => (
            <div key={container.id} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
              <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-green-100 text-green-600' : 
                index === 1 ? 'bg-blue-100 text-blue-600' : 
                index === 2 ? 'bg-yellow-100 text-yellow-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                {index + 1}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-800">
                    Contenidor {container.cod}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(container.tipus)}`}>
                    {container.tipus}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{container.ciutat}</span>
                  
                  <Flag className="h-3.5 w-3.5 ml-3 mr-1" />
                  <span>{container.total_reciclajes} usos</span>
                </div>
                
                {(container.zona_data?.empresa?.nom || container.empresa?.nom) && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Building className="h-3 w-3 mr-1" />
                    <span>{container.zona_data?.empresa?.nom || container.empresa?.nom}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
