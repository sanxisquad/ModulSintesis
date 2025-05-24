import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Flag, CheckCircle, 
  Award, BarChart2, Trophy, Recycle
} from 'lucide-react';
import { getGeneralStats, getTopRecyclers, getTopReporters } from '../../api/stats.api';
import { TopRecyclersWidget } from './TopRecyclersWidget';
import { TopReportersWidget } from './TopReportersWidget';

export function HomeStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getGeneralStats();
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching general stats:", error);
        setError("No s'han pogut carregar les dades generals");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 my-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 rounded-lg my-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
            Estadístiques Globals
          </h2>
          <p className="text-gray-500 text-sm">Resum d'activitat de reciclatge de la comunitat</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Usuaris</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.total_users || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Productes Reciclats</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.total_productos_reciclados || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Recycle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Reportes</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.total_reportes || 0}</p>
                <div className="flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-gray-500">{stats?.total_reportes_resueltos || 0} resolts</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Flag className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Punts Totals</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.total_puntos?.toLocaleString() || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rankings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Recyclers Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Top Recicladors
            </h3>
            <TopRecyclersWidget />
          </div>
          
          {/* Top Reporters Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4">
              <Flag className="h-5 w-5 text-red-500 mr-2" />
              Top Reportadors
            </h3>
            <TopReportersWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
