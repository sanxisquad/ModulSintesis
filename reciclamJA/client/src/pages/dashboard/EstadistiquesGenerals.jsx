import React, { useState, useEffect } from 'react';
import { 
  Users, Package, Flag, CheckCircle, 
  Award, BarChart2, Activity, Settings
} from 'lucide-react';
import { TopRecyclersWidget } from '../../components/stats/TopRecyclersWidget';
import { TopReportersWidget } from '../../components/stats/TopReportersWidget';
import { TopContainersWidget } from '../../components/stats/TopContainersWidget';
import { getGeneralStats } from '../../api/stats.api';
import { useAuth } from '../../../hooks/useAuth';

export function EstadistiquesGenerals() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGeneralStats = async () => {
      try {
        const response = await getGeneralStats();
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching general stats:", error);
        setError("No s'han pogut carregar les dades generals");
        setLoading(false);
      }
    };

    fetchGeneralStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Estadístiques Generals</h1>
          <p className="text-gray-500">Resum d'activitat de reciclatge i reportes</p>
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
                <Package className="h-6 w-6 text-green-600" />
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

        {/* Company Info for admins/gestors */}
        {stats?.empresa && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Informació d'Empresa</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Empresa</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stats.empresa.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Zones</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stats.total_zonas || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Contenidors</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{stats.total_contenedores || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <TopRecyclersWidget />
          <TopReportersWidget />
          <TopContainersWidget />
        </div>
      </div>
    </div>
  );
}
