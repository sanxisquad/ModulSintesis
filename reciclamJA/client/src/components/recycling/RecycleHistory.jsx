import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaRecycle, FaHistory, FaClock, FaChartPie, FaArchive, FaExclamationCircle } from 'react-icons/fa';

const RecycleHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total_puntos: 0,
    total_productos: 0,
    por_material: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchHistory();
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
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaHistory className="mr-2 text-green-600" /> El Meu Historial de Reciclatge
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
    </div>
  );
};

export default RecycleHistory;
