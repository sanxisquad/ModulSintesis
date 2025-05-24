import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Trash2, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { TopRecyclersWidget } from '../components/statistics/TopRecyclersWidget';
import { TopReportersWidget } from '../components/statistics/TopReportersWidget';
import { TopContainersWidget } from '../components/statistics/TopContainersWidget';
import { getGeneralStats } from '../api/stats.api';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

export function EstadistiquesGenerals() {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin, isGestor } = usePermissions();
  const [generalStats, setGeneralStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralStats();
  }, []);

  const fetchGeneralStats = async () => {
    try {
      const response = await getGeneralStats();
      setGeneralStats(response.data);
    } catch (error) {
      console.error('Error fetching general stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-6 md:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pb-5 border-b border-gray-200 mb-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Estadístiques Generals</h1>
              <p className="text-gray-500 text-sm">
                {isSuperAdmin ? 'Vista global del sistema' : 
                 isAdmin || isGestor ? `Estadístiques de ${user?.empresa?.nom || 'la teva empresa'}` :
                 'Descobreix qui lidera el reciclatge'}
              </p>
            </div>
          </div>
        </div>

        {/* General Stats Cards */}
        {!loading && generalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Usuaris Actius"
              value={generalStats.total_users}
              subtitle="Aquest mes"
              color="bg-blue-500"
            />
            <StatCard
              icon={Trash2}
              title="Productes Reciclats"
              value={generalStats.total_productos_reciclados}
              subtitle="Total acumulat"
              color="bg-green-500"
            />
            <StatCard
              icon={MessageSquare}
              title="Tiquets Resolts"
              value={generalStats.total_reportes_resueltos}
              subtitle={`${generalStats.total_reportes} totals`}
              color="bg-purple-500"
            />
            <StatCard
              icon={Award}
              title="Punts Totals"
              value={generalStats.total_puntos}
              subtitle="Guanyats pels usuaris"
              color="bg-amber-500"
            />
          </div>
        )}

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Top Recyclers - Visible para todos */}
          <TopRecyclersWidget />
          
          {/* Top Reporters - Solo para gestores/admins o usuarios normales ven solo su empresa */}
          <TopReportersWidget />
          
          {/* Top Containers - Solo para gestores/admins o usuarios ven solo su empresa */}
          {(isAdmin || isGestor || isSuperAdmin) && (
            <TopContainersWidget />
          )}
        </div>

        {/* Motivational Section for Regular Users */}
        {!isAdmin && !isGestor && !isSuperAdmin && (
          <div className="mt-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 mr-4" />
              <div>
                <h3 className="text-xl font-bold">Segueix reciclant!</h3>
                <p className="mt-2">
                  Cada producte que recicles ajuda al medi ambient i et dona punts per bescanviar per premis genials.
                </p>
                <p className="mt-1 text-sm opacity-90">
                  Els teus punts actuals: <span className="font-bold">{user?.score || 0}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
