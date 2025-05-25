import React, { useState, useEffect } from 'react';
import { Trophy, User, Award, Medal } from 'lucide-react';
import { getTopRecyclers } from '../../api/stats.api';

export function TopRecyclersWidget() {
  const [topRecyclers, setTopRecyclers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopRecyclers();
  }, []);

  const fetchTopRecyclers = async () => {
    try {
      const response = await getTopRecyclers();
      setTopRecyclers(response.data);
    } catch (error) {
      console.error('Error fetching top recyclers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const getRankBgColor = (index) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 1: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 2: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Trophy className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Top Recicladors</h3>
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
        <Trophy className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Top Recicladors</h3>
      </div>
      
      <div className="space-y-3">
        {topRecyclers.map((recycler, index) => (
          <div 
            key={recycler.id} 
            className={`p-3 rounded-lg border ${getRankBgColor(index)} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 mr-3">
                  {getRankIcon(index)}
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {recycler.first_name} {recycler.last_name}
                    </p>
                    {recycler.empresa?.nom && (
                      <p className="text-xs text-gray-500">{recycler.empresa.nom}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{recycler.total_score} punts</p>
                <p className="text-sm text-gray-500">{recycler.productos_reciclados} productes</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {topRecyclers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Encara no hi ha dades de reciclatge</p>
        </div>
      )}
    </div>
  );
}
