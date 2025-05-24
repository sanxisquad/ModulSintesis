import React, { useState, useEffect } from 'react';
import { Trophy, User, Building, Package, Star } from 'lucide-react';
import { getTopRecyclers } from '../../api/stats.api';

export function TopRecyclersWidget() {
  const [topRecyclers, setTopRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRecyclers = async () => {
      try {
        const response = await getTopRecyclers();
        setTopRecyclers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top recyclers:", error);
        setError("No s'han pogut carregar les dades");
        setLoading(false);
      }
    };

    fetchTopRecyclers();
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

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Top Recicladors</h2>
      </div>
      
      {topRecyclers.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No hi ha dades disponibles encara
        </div>
      ) : (
        <div className="space-y-4">
          {topRecyclers.map((recycler, index) => (
            <div key={recycler.id} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
              <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                index === 1 ? 'bg-gray-200 text-gray-600' : 
                index === 2 ? 'bg-amber-100 text-amber-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                {index + 1}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-800">
                    {recycler.first_name} {recycler.last_name || recycler.username}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Package className="h-3.5 w-3.5 mr-1" />
                  <span>{recycler.productos_reciclados} productes</span>
                  
                  <Star className="h-3.5 w-3.5 ml-3 mr-1 text-yellow-500" />
                  <span>{recycler.total_score} punts</span>
                </div>
                
                {recycler.empresa && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Building className="h-3 w-3 mr-1" />
                    <span>{recycler.empresa.nom}</span>
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
