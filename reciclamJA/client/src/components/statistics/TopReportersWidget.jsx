import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Shield, AlertTriangle } from 'lucide-react';
import { getTopReporters } from '../../api/stats.api';
import { usePermissions } from '../../../hooks/usePermissions';

export function TopReportersWidget() {
  const [topReporters, setTopReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin } = usePermissions();

  useEffect(() => {
    fetchTopReporters();
  }, []);

  const fetchTopReporters = async () => {
    try {
      const response = await getTopReporters();
      setTopReporters(response.data);
    } catch (error) {
      console.error('Error fetching top reporters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[index] || `#${index + 1}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Top Reporters</h3>
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
        <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Top Reporters</h3>
        <Shield className="h-4 w-4 text-gray-400 ml-2" title="Usuaris que més ajuden reportant problemes" />
      </div>
      
      <div className="space-y-3">
        {topReporters.map((reporter, index) => (
          <div key={reporter.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <span className="text-lg mr-3">{getRankBadge(index)}</span>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {reporter.first_name} {reporter.last_name}
                  </p>
                  {isSuperAdmin && reporter.empresa?.nom && (
                    <p className="text-xs text-gray-500">{reporter.empresa.nom}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{reporter.total_reportes} tiquets</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-600">{reporter.reportes_resueltos} resolts</span>
                {reporter.reportes_rechazados > 0 && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-red-600">{reporter.reportes_rechazados} rebutjats</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {topReporters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Encara no hi ha tiquets reportats</p>
        </div>
      )}
    </div>
  );
}
