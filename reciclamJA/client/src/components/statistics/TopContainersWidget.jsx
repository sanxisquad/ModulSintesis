import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, TrendingUp, Recycle } from 'lucide-react';
import { getTopContainers } from '../../api/stats.api';
import { usePermissions } from '../../../hooks/usePermissions';

export function TopContainersWidget() {
  const [topContainers, setTopContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    fetchTopContainers();
  }, []);

  const fetchTopContainers = async () => {
    try {
      const response = await getTopContainers();
      setTopContainers(response.data);
    } catch (error) {
      console.error('Error fetching top containers:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getRankBadge = (index) => {
    const badges = ['🏆', '🥈', '🥉'];
    return badges[index] || `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Recycle className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Contenidors Més Usats</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Recycle className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Contenidors Més Usats</h3>
        <TrendingUp className="h-4 w-4 text-gray-400 ml-2" title="Contenidors amb més activitat de reciclatge" />
      </div>
      
      <div className="space-y-3">
        {topContainers.map((container, index) => (
          <div key={container.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <span className="text-lg mr-3">{getRankBadge(index)}</span>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Trash2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium text-gray-800 mr-2">{container.cod}</p>
                    <div className={`w-3 h-3 rounded-full ${getTipusBgColor(container.tipus)}`} title={container.tipus}></div>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{container.ciutat}</span>
                    {isSuperAdmin && container.zona_data?.empresa?.nom && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{container.zona_data.empresa.nom}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{container.total_reciclajes} usos</p>
              <p className="text-sm text-gray-500 capitalize">{container.tipus}</p>
            </div>
          </div>
        ))}
      </div>
      
      {topContainers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trash2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Encara no hi ha dades de reciclatge en contenidors</p>
        </div>
      )}
    </div>
  );
}
