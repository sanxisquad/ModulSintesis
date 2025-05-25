import React, { useState, useEffect } from 'react';
import { Award, User, Building, Flag, CheckCircle, XCircle } from 'lucide-react';
import { getTopReporters } from '../../api/stats.api';

export function TopReportersWidget() {
  const [topReporters, setTopReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopReporters = async () => {
      try {
        const response = await getTopReporters();
        setTopReporters(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top reporters:", error);
        setError("No s'han pogut carregar les dades");
        setLoading(false);
      }
    };

    fetchTopReporters();
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
        <Award className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Top Reportadors</h2>
      </div>
      
      {topReporters.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No hi ha dades disponibles encara
        </div>
      ) : (
        <div className="space-y-4">
          {topReporters.map((reporter, index) => (
            <div key={reporter.id} className="flex items-center p-3 hover:bg-gray-50 rounded-md">
              <div className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-blue-100 text-blue-600' : 
                index === 1 ? 'bg-gray-200 text-gray-600' : 
                index === 2 ? 'bg-amber-100 text-amber-600' : 
                'bg-green-100 text-green-600'
              }`}>
                {index + 1}
              </div>
              
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-800">
                    {reporter.first_name} {reporter.last_name || reporter.username}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                  <Flag className="h-3.5 w-3.5 mr-1" />
                  <span>{reporter.total_reportes} reportes</span>
                  
                  <div className="flex items-center ml-3">
                    <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                    <span>{reporter.reportes_resueltos}</span>
                  </div>
                  
                  <div className="flex items-center ml-3">
                    <XCircle className="h-3.5 w-3.5 mr-1 text-red-500" />
                    <span>{reporter.reportes_rechazados}</span>
                  </div>
                </div>
                
                {reporter.empresa && (
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Building className="h-3 w-3 mr-1" />
                    <span>{reporter.empresa.nom}</span>
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
