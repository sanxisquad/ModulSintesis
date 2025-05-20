import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaRecycle, FaHistory, FaClock, FaChartPie, FaArchive, FaExclamationCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { obtenerBolsas, agregarProductoABolsa } from '../../api/reciclajeApi';

export function RecycleHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total_puntos: 0,
    total_productos: 0,
    por_material: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bags, setBags] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddToBagModal, setShowAddToBagModal] = useState(false);
  const [selectedBag, setSelectedBag] = useState(null);
  const [loadingBags, setLoadingBags] = useState(false);
  
  useEffect(() => {
    fetchHistory();
    fetchBags();
  }, []);
  
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reciclar/historial/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Comprobaciones de seguridad para los datos recibidos
      if (response.data && typeof response.data === 'object') {
        setHistory(Array.isArray(response.data.productos) ? response.data.productos : []);
        
        if (response.data.estadisticas && typeof response.data.estadisticas === 'object') {
          setStats({
            total_puntos: response.data.estadisticas.total_puntos || 0,
            total_productos: response.data.estadisticas.total_productos || 0,
            por_material: response.data.estadisticas.por_material || {}
          });
        }
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setError('Format de resposta inesperat del servidor');
        toast.error('Error en carregar l\'historial: format de resposta incorrecte');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setLoading(false);
      setError('Error al carregar l\'historial');
      toast.error('No s\'ha pogut carregar l\'historial de reciclatge');
    }
  };
  
  const fetchBags = async () => {
    try {
      setLoadingBags(true);
      const data = await obtenerBolsas();
      // Filter out bags that are already recycled
      setBags(data.filter(b => !b.reciclada));
      setLoadingBags(false);
    } catch (error) {
      console.error("Error fetching bags:", error);
      setLoadingBags(false);
    }
  };
  
  const handleAddToBag = (product) => {
    setSelectedProduct(product);
    setShowAddToBagModal(true);
  };
  
  const handleConfirmAddToBag = async () => {
    if (!selectedProduct || !selectedBag) {
      toast.error("Si us plau, selecciona una bossa");
      return;
    }
    
    try {
      await agregarProductoABolsa(selectedProduct.id, selectedBag);
      toast.success("Producte afegit a la bossa");
      setShowAddToBagModal(false);
      setSelectedProduct(null);
      setSelectedBag(null);
      // Refresh history to update UI
      fetchHistory();
      // Refresh bags to get updated points
      fetchBags();
    } catch (error) {
      console.error("Error adding to bag:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("No s'ha pogut afegir el producte a la bossa");
      }
    }
  };
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Si la fecha no es válida, devolver el string original
      }
      
      return date.toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  // Mostrar estadísticas resumidas
  const renderStats = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <FaChartPie className="mr-2 text-blue-500" /> Estadístiques de Reciclatge
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total Productes</p>
            <p className="text-2xl font-bold text-green-600">{stats.total_productos}</p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Punts Guanyats</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total_puntos}</p>
          </div>
          
          {Object.keys(stats.por_material).length > 0 && (
            <div className="col-span-2 md:col-span-1 bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Material més reciclat</p>
              {Object.entries(stats.por_material)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 1)
                .map(([material, cantidad]) => (
                  <p key={material} className="text-lg font-bold text-purple-600">
                    {material} <span className="text-sm font-normal">({cantidad} productes)</span>
                  </p>
                ))
              }
            </div>
          )}
        </div>
        
        {Object.keys(stats.por_material).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Distribució per materials</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.por_material).map(([material, cantidad]) => (
                <div key={material} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {material}: {cantidad}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Renderizar cada elemento del historial
  const renderHistoryItem = (item) => {
    if (!item || typeof item !== 'object') return null;
    
    return (
      <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-100">
        <div className="flex items-center">
          {item.imagen_url ? (
            <img 
              src={item.imagen_url} 
              alt={item.nombre_producto || 'Producto'} 
              className="w-16 h-16 object-contain mr-3 bg-gray-50 rounded p-1"
              onError={(e) => {
                e.target.src = ''; // Limpiar la imagen que falló
                e.target.onerror = null; // Evitar bucle infinito
                e.target.className = "w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3";
                e.target.parentNode.innerHTML = '<div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3"><svg class="text-gray-400 w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path d="M3 7v10a1 1 0 001 1h12a1 1 0 001-1V7H3z"></path></svg></div>';
              }}
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3">
              <FaArchive className="text-gray-400 text-2xl" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium">{item.nombre_producto || 'Producte desconegut'}</h3>
            {item.marca && <p className="text-sm text-gray-600">{item.marca}</p>}
            
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <FaClock className="mr-1" /> {formatDate(item.fecha_reciclaje)}
            </div>
          </div>
          
          <div className="text-right">
            {item.material && (
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-1"
                style={{ 
                  backgroundColor: item.material.color ? `${item.material.color}22` : '#f3f4f6',
                  color: item.material.color || '#374151' 
                }}
              >
                {item.material.nombre || 'Material'}
              </span>
            )}
            <div className="text-green-600 font-bold">+{item.puntos_obtenidos || 0} pts</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Add a button for each product to add it to a bag
  const renderProductItem = (product) => (
    <div 
      key={product.id} 
      className="bg-white rounded-lg border p-4 flex flex-col md:flex-row items-center shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0">
        {product.imagen_url ? (
          <img 
            src={product.imagen_url} 
            alt={product.nombre_producto || 'Producto'} 
            className="w-16 h-16 object-contain mr-3 bg-gray-50 rounded p-1"
            onError={(e) => {
              e.target.src = ''; // Limpiar la imagen que falló
              e.target.onerror = null; // Evitar bucle infinito
              e.target.className = "w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3";
              e.target.parentNode.innerHTML = '<div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3"><svg class="text-gray-400 w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path><path d="M3 7v10a1 1 0 001 1h12a1 1 0 001-1V7H3z"></path></svg></div>';
            }}
          />
        ) : (
          <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded mr-3">
            <FaArchive className="text-gray-400 text-2xl" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{product.nombre_producto || 'Producte desconegut'}</h3>
        {product.marca && <p className="text-sm text-gray-600 truncate">{product.marca}</p>}
        
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <FaClock className="mr-1" /> {formatDate(product.fecha_reciclaje)}
        </div>
      </div>
      
      {/* Add buttons at the bottom */}
      <div className="flex items-center space-x-2 mt-3 md:mt-0">
        <button 
          onClick={() => handleAddToBag(product)}
          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
        >
          <FaPlus className="mr-1 h-3 w-3" /> Afegir a Bossa
        </button>
      </div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center mb-2 text-red-600">
          <FaExclamationCircle className="mr-2" />
          <h3 className="font-bold">Error</h3>
        </div>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tornar a intentar
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaRecycle className="mr-2 text-green-500" /> Historial de Reciclatge
      </h2>
      
      {renderStats()}
      
      {history && history.length > 0 ? (
        <div>
          {history.map(item => renderHistoryItem(item))}
        </div>
      ) : (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <FaRecycle className="mx-auto text-4xl text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No has reciclat cap producte encara</h3>
          <p className="text-gray-500 mt-1">Escaneja codis de barres de productes per començar a reciclar.</p>
        </div>
      )}
      
      {/* Add to Bag Modal */}
      {showAddToBagModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Afegir a Bossa</h3>
              <button 
                onClick={() => setShowAddToBagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 flex items-center">
                {selectedProduct.imagen_url ? (
                  <img 
                    src={selectedProduct.imagen_url} 
                    alt={selectedProduct.nombre_producto} 
                    className="w-16 h-16 object-contain mr-4" 
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    <FaBox className="text-gray-400 text-2xl" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium">{selectedProduct.nombre_producto}</h4>
                  <p className="text-sm text-gray-600">{selectedProduct.material.nombre}</p>
                </div>
              </div>
              
              <p className="mb-3">Selecciona una bossa per afegir aquest producte:</p>
              
              {loadingBags ? (
                <div className="flex justify-center py-4">
                  <Spinner size="md" color="blue" />
                </div>
              ) : bags.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bags
                    .filter(bag => bag.tipo_material.nombre === selectedProduct.material.nombre)
                    .map(bag => (
                    <button
                      key={bag.id}
                      onClick={() => setSelectedBag(bag.id)}
                      className={`w-full p-3 border rounded-lg flex justify-between items-center ${
                          selectedBag === bag.id 
                          ? 'bg-green-50 border-green-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <FaTrash className="text-gray-500 mr-2" />
                        <span>{bag.nombre || `Bossa #${bag.id}`}</span>
                      </div>
                      <span className="text-sm text-green-600 font-medium">{bag.puntos_totales} pts</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No hi ha bosses disponibles per {selectedProduct.material.nombre}</p>
                  <Link 
                    to="/profile" 
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    Crear una nova bossa
                  </Link>
                </div>
              )}
              
              {bags.filter(bag => bag.tipo_material.nombre === selectedProduct.material.nombre).length === 0 && 
               bags.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-700">
                    No tens bosses del tipus <strong>{selectedProduct.material.nombre}</strong>. 
                    Necessites crear una bossa d'aquest material.
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddToBagModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleConfirmAddToBag}
                  disabled={!selectedBag}
                  className={`px-4 py-2 rounded-lg text-white ${
                    selectedBag ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Afegir a Bossa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecycleHistory;
