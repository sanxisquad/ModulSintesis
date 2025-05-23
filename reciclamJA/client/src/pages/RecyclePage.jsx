import React, { useState, useEffect } from 'react';
import { FaQrcode, FaInfoCircle, FaTrophy, FaRecycle, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { BarcodeScanner } from '../components/recycling/BarcodeScanner'; // Changed from default to named import

const RecyclePage = () => {
  const { isAuthenticated, user, loading } = useAuth();
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
      {/* Enhanced header with gradient background and animated leaf */}
      <div className="relative bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg mb-8 p-6 overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <FaLeaf className="text-white w-40 h-40 transform -rotate-12" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Reciclar i Guanyar Punts</h1>
            <p className="text-green-100 text-sm md:text-base">Escaneja productes per reciclar i acumula punts</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
            <div className="flex items-center">
              <FaTrophy className="text-yellow-300 mr-2 text-xl" />
              <div>
                <p className="text-xs text-green-100">Els teus punts</p>
                <p className="font-bold text-white text-2xl">{user?.score || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scanner section with improved styling */}
      <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
        <div className="py-4 px-5 bg-green-600 text-white flex items-center justify-between">
          <h2 className="font-bold flex items-center text-lg">
            <FaQrcode className="mr-2" /> Escàner de Codis de Barres
          </h2>
          <span className="bg-green-500 text-xs px-3 py-1 rounded-full">Actiu</span>
        </div>
        
        <div className="p-4">
          <BarcodeScanner onScanComplete={handleScanComplete} />
        </div>
      </div>
      
      {/* Enhanced info section with icons and cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-medium flex items-center text-blue-800 mb-3">
            <FaInfoCircle className="mr-2 text-blue-500" /> Com funciona?
          </h3>
          <p className="text-blue-700">
            Escaneja el codi de barres dels productes que vols reciclar. El sistema identificarà el 
            material i t'indicarà en quin contenidor has de dipositar-lo.
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-5 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-medium flex items-center text-green-800 mb-3">
            <FaRecycle className="mr-2 text-green-500" /> Beneficis del reciclatge
          </h3>
          <p className="text-green-700">
            Per cada producte reciclat correctament, rebràs punts que podràs bescanviar per recompenses i 
            contribuiràs a millorar el medi ambient.
          </p>
        </div>
      </div>
      
      {/* Steps for successful recycling */}
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="font-bold text-gray-700 mb-4 text-lg">Passos per a un reciclatge exitós</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Escaneja</h4>
            <p className="text-gray-600 text-sm">Utilitza l'escàner per identificar el producte</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold text-green-600">2</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Recicla</h4>
            <p className="text-gray-600 text-sm">Diposita'l al contenidor indicat</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold text-yellow-600">3</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Guanya</h4>
            <p className="text-gray-600 text-sm">Acumula punts i bescanvia'ls per premis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclePage;
