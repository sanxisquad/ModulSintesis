import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPrizes, redeemPrize } from '../../api/premio.api';
import { useAuth } from '../../../hooks/useAuth';
import { FaGift, FaCoins, FaSearch, FaCrown, FaRegSadTear, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const PrizesPage = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        setLoading(true);
        const response = await getAllPrizes();
        // Only show prizes with quantity > 0 and active
        const availablePrizes = response.data.filter(prize => 
          prize.cantidad > 0 && prize.activo
        );
        setPrizes(availablePrizes);
        setError(null);
      } catch (err) {
        console.error("Error loading prizes:", err);
        setError("Hi ha hagut un problema carregant els premis disponibles.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrizes();
  }, []);
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  const handleRedeemClick = (prize) => {
    if (!isAuthenticated) {
      toast.error("Cal iniciar sessió per bescanviar premis");
      return;
    }
    
    if (user.score < prize.puntos_costo) {
      toast.error(`No tens prou punts. Necessites ${prize.puntos_costo} punts.`);
      return;
    }
    
    setSelectedPrize(prize);
    setShowConfirm(true);
  };
  
  const handleConfirmRedeem = async () => {
    try {
      const response = await redeemPrize(selectedPrize.id);
      toast.success("Premi bescanviat correctament! Consulta el teu perfil per veure els detalls.", { duration: 5000 });
      // Refresh prizes list
      const updatedPrizes = prizes.map(prize => 
        prize.id === selectedPrize.id 
          ? { ...prize, cantidad: prize.cantidad - 1 }
          : prize
      ).filter(prize => prize.cantidad > 0);
      setPrizes(updatedPrizes);
      setShowConfirm(false);
    } catch (err) {
      console.error("Error redeeming prize:", err);
      toast.error(err.response?.data?.error || "Hi ha hagut un problema bescanviant el premi.");
    }
  };
  
  // Filter prizes based on search
  const filteredPrizes = prizes.filter(prize => 
    prize.nombre.toLowerCase().includes(search.toLowerCase()) ||
    prize.descripcion.toLowerCase().includes(search.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-green-100 p-3 rounded-full mb-4">
          <FaGift className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">Premis Disponibles</h1>
        <p className="mt-2 text-center text-gray-600 max-w-2xl">
          Bescanvia els punts que has guanyat reciclant per aquests increïbles premis sostenibles!
        </p>
        
        {isAuthenticated && (
          <div className="mt-6 bg-green-50 px-6 py-4 rounded-lg shadow-sm flex items-center">
            <FaCrown className="h-8 w-8 text-yellow-500 mr-4" />
            <div>
              <p className="text-gray-700">Els teus punts actuals</p>
              <p className="text-2xl font-bold text-green-600">{user.score} punts</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Search bar */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Cerca premis..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-green-500 focus:border-green-500"
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <FaSearch />
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      ) : filteredPrizes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FaRegSadTear className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">No hi ha premis disponibles</h3>
          <p className="mt-2 text-gray-500">
            {search ? 'No hem trobat premis que coincideixin amb la teva cerca.' : 'Torna a comprovar més tard per veure nous premis.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrizes.map(prize => (
            <div key={prize.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200">
                {prize.imagen ? (
                  <img 
                    src={prize.imagen} 
                    alt={prize.nombre} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaGift className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800">{prize.nombre}</h3>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                    <FaCoins className="mr-1" /> {prize.puntos_costo}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{prize.descripcion}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    {prize.cantidad} {prize.cantidad === 1 ? 'unitat' : 'unitats'} disponibles
                  </span>
                  {/* Botón condicional de canjear/iniciar sesión */}
                  {isAuthenticated ? (
                    <button
                      onClick={() => handleRedeemClick(prize)}
                      className={`px-4 py-2 rounded-md ${
                        user.score >= prize.puntos_costo
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      disabled={user.score < prize.puntos_costo}
                    >
                      {user.score >= prize.puntos_costo ? 'Bescanviar' : 'Punts insuficients'}
                    </button>
                  ) : (
                    <Link to="/login" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
                      Inicia sessió
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Dialog - Personalizado */}
      {showConfirm && selectedPrize && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmRedeem}
          title="Bescanviar Premi"
          message={
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaGift className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{selectedPrize.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedPrize.empresa_nombre ? `De ${selectedPrize.empresa_nombre}` : 'Premi de ReciclamJA'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Cost del premi:</span>
                  <span className="text-sm font-bold text-green-600 flex items-center">
                    <FaCoins className="mr-1" /> {selectedPrize.puntos_costo} punts
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Els teus punts actuals:</span>
                  <span className="text-sm font-bold">{user.score} punts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Punts restants després:</span>
                  <span className="text-sm font-bold">{user.score - selectedPrize.puntos_costo} punts</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg flex">
                <FaInfoCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5 mr-2" />
                <div className="text-sm text-blue-700">
                  <p>En bescanviar aquest premi, rebràs un codi de confirmació que podràs mostrar per reclamar-lo.</p>
                  <p className="mt-1">Aquesta acció no es pot desfer.</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                ¿Estàs segur que vols bescanviar aquest premi?
              </p>
            </div>
          }
          confirmText="Bescanviar ara"
          cancelText="Cancel·lar"
        />
      )}
    </div>
  );
};
