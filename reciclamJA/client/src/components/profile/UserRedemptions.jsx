import React, { useState, useEffect } from 'react';
import { getUserRedemptions } from '../../api/premio.api';
import { FaGift, FaCheck, FaSpinner, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Spinner } from '../common/Spinner';

export const UserRedemptions = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        setLoading(true);
        const response = await getUserRedemptions();
        setRedemptions(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching redemptions:", err);
        setError("No s'han pogut carregar les teves redempcions de premis");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRedemptions();
  }, []);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'procesando':
        return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'entregado':
        return <FaCheck className="text-green-500" />;
      case 'cancelado':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'pendiente':
        return 'Pendent de lliurament';
      case 'procesando':
        return 'En procés';
      case 'entregado':
        return 'Lliurat';
      case 'cancelado':
        return 'Cancel·lat';
      default:
        return status;
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <FaGift className="mr-2 text-green-500" />
          Historial de Premis Bescanviats
        </h2>
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" color="green" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
          <FaGift className="mr-2 text-green-500" />
          Historial de Premis Bescanviats
        </h2>
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="flex items-center">
            <FaExclamationTriangle className="mr-2" /> {error}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
        <FaGift className="mr-2 text-green-500" />
        Historial de Premis Bescanviats
      </h2>
      
      {redemptions.length === 0 ? (
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaGift className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No has bescanviat cap premi encara</h3>
          <p className="text-gray-500 mb-6">Quan bescanviïs premis amb els teus punts, apareixeran aquí</p>
          <a 
            href="/premis" 
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
          >
            <FaGift className="mr-2" /> Veure premis disponibles
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premi</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punts</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estat</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {redemptions.map(redemption => (
                <tr key={redemption.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{redemption.premio_nombre}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(redemption.fecha_redencion).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{redemption.puntos_gastados} pts</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(redemption.estado)}
                      <span className="ml-2 text-sm text-gray-700">{getStatusText(redemption.estado)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">{redemption.codigo_confirmacion}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
