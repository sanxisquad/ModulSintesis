import React, { useState } from 'react';
import { FaQrcode, FaHistory, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import BarcodeScanner from '../components/recycling/BarcodeScanner';
import RecycleHistory from '../components/recycling/RecycleHistory';

const RecyclePage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('scanner');
  const [lastScanResult, setLastScanResult] = useState(null);
  
  // Si l'usuari no està autenticat, redirigir al login
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Si està carregant, mostrar spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  // Gestionar el resultat de l'escaneig
  const handleScanComplete = (result) => {
    setLastScanResult(result);
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reciclar i Guanyar Punts</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Hola, {user?.username}</p>
          <p className="font-bold text-green-600">
            {user?.score || 0} punts acumulats
          </p>
        </div>
      </div>
      
      {/* Pestanyes per canviar entre escàner i historial */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 font-medium flex items-center justify-center ${
              activeTab === 'scanner' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('scanner')}
          >
            <FaQrcode className="mr-2" /> Escàner
          </button>
          <button
            className={`flex-1 py-3 px-4 font-medium flex items-center justify-center ${
              activeTab === 'history' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <FaHistory className="mr-2" /> Historial
          </button>
        </div>
      </div>
      
      {/* Contingut segons la pestanya activa */}
      {activeTab === 'scanner' ? (
        <BarcodeScanner onScanComplete={handleScanComplete} />
      ) : (
        <RecycleHistory />
      )}
      
      {/* Informació sobre reciclatge */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="font-medium flex items-center text-blue-800">
          <FaInfoCircle className="mr-2" /> Com funciona?
        </h3>
        <p className="mt-2 text-blue-700 text-sm">
          Escaneja el codi de barres dels productes que vols reciclar. El sistema identificarà el 
          material i t'indicarà en quin contenidor has de dipositar-lo. Per cada producte reciclat 
          correctament, rebràs punts que podràs bescanviar per recompenses.
        </p>
      </div>
    </div>
  );
};

export default RecyclePage;
