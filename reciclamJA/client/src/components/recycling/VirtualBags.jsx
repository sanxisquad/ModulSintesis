import React, { useState, useEffect } from 'react';
import { obtenerBolsas, crearBolsa, reciclarBolsa, obtenerDetalleBolsa } from '../../api/reciclajeApi';
import { getAllPublicContenedors } from '../../api/zr.api';
import { toast } from 'react-hot-toast';
import { FaRecycle, FaTrash, FaPlus, FaBox, FaBoxOpen, FaMapMarkerAlt, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { Spinner } from '../common/Spinner';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different container types
const containerIcons = {
  paper: new L.Icon({
    iconUrl: '/icons/contenedor-azul.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  plàstic: new L.Icon({
    iconUrl: '/icons/contenedor-amarillo.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  vidre: new L.Icon({
    iconUrl: '/icons/contenedor-verde.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  orgànic: new L.Icon({
    iconUrl: '/icons/contenedor-marron.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  resta: new L.Icon({
    iconUrl: '/icons/contenedor-gris.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  metall: new L.Icon({
    iconUrl: '/icons/contenedor-amarillo.png', // Metal usually goes in yellow container
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
};

export function VirtualBags() {
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBag, setSelectedBag] = useState(null);
  const [bagDetails, setBagDetails] = useState(null);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [nearbyContainers, setNearbyContainers] = useState([]);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [createBagModal, setCreateBagModal] = useState(false);
  const [newBagType, setNewBagType] = useState('');

  useEffect(() => {
    fetchBags();
  }, []);

  const fetchBags = async () => {
    try {
      setLoading(true);
      const data = await obtenerBolsas();
      setBags(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bags:", error);
      toast.error("No s'han pogut carregar les bosses");
      setLoading(false);
    }
  };

  const handleCreateBag = async () => {
    if (!newBagType) {
      toast.error("Has de seleccionar un tipus de material");
      return;
    }

    try {
      // Convertir el ID numérico al tipo correspondiente en el backend
      const materialTypeMap = {
        1: 'plàstic',   // Asegurar que esto coincide con los valores en el modelo Django
        2: 'paper',
        3: 'vidre',
        4: 'plàstic',   // Metall se recicla en el contenedor de plàstic
        5: 'orgànic',
        6: 'rebuig'
      };
      
      // Pasar el tipo de material como string en lugar de ID
      await crearBolsa(materialTypeMap[newBagType] || newBagType);
      toast.success("Bossa creada correctament");
      setCreateBagModal(false);
      fetchBags();
    } catch (error) {
      toast.error("Error al crear la bossa");
    }
  };

  const handleOpenBag = async (bagId) => {
    try {
      const details = await obtenerDetalleBolsa(bagId);
      setBagDetails(details);
      setSelectedBag(bags.find(bag => bag.id === bagId));
    } catch (error) {
      toast.error("Error al obrir la bossa");
    }
  };

  const handleRecycleBag = async (bagId) => {
    if (!bagId) return;

    setSelectedBag(bags.find(bag => bag.id === bagId));
    setShowRecycleModal(true);
    
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchNearbyContainers(latitude, longitude, bags.find(bag => bag.id === bagId).tipo_material.nombre);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("No s'ha pogut obtenir la teva ubicació");
        fetchNearbyContainers(null, null, bags.find(bag => bag.id === bagId).tipo_material.nombre);
      }
    );
  };

  const fetchNearbyContainers = async (lat, lng, materialType) => {
    try {
      setLoadingContainers(true);
      // Get all containers
      const response = await getAllPublicContenedors();
      
      // Normalizar el tipo de material para coincidir con los contenedores
      const normalizedMaterialType = materialType.toLowerCase();
      
      // Mapeo de tipos de materiales a tipos de contenedores
      const materialToContainerMap = {
        'metal': 'plàstic',       // El metal va al contenedor amarillo
        'metall': 'plàstic', 
        'papel': 'paper',
        'paper/cartró': 'paper',
        'resto': 'rebuig',
        'resta': 'rebuig'
      };
      
      // Obtener el tipo de contenedor correspondiente al material
      const containerType = materialToContainerMap[normalizedMaterialType] || normalizedMaterialType;
      
      console.log(`Buscando contenedores de tipo: ${containerType} para material: ${materialType}`);
      
      // Filter by material type, usando el mapeo si es necesario
      let filtered = response.data.filter(c => {
        const containerTipus = c.tipus && c.tipus.toLowerCase();
        return containerTipus === containerType;
      });
      
      // Sort by proximity if location is available
      if (lat && lng) {
        filtered = filtered.map(container => {
          const distance = calculateDistance(
            lat, lng, 
            container.latitud, container.longitud
          );
          return { ...container, distance };
        }).sort((a, b) => a.distance - b.distance);
      }
      
      setNearbyContainers(filtered);
      setLoadingContainers(false);
    } catch (error) {
      console.error("Error fetching containers:", error);
      toast.error("No s'han pogut carregar els contenidors propers");
      setLoadingContainers(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleCompleteRecycle = async () => {
    if (!selectedBag || !selectedContainer) {
      toast.error("Has de seleccionar una bossa i un contenidor");
      return;
    }

    try {
      const result = await reciclarBolsa(selectedBag.id, selectedContainer.id);
      toast.success(`Bossa reciclada! Has guanyat ${result.puntos_obtenidos} punts`, {
        duration: 5000 // Mostrar este mensaje más tiempo
      });
      setShowRecycleModal(false);
      fetchBags();
    } catch (error) {
      toast.error("Error al reciclar la bossa");
    }
  };

  // Render material badge
  const MaterialBadge = ({ material }) => {
    const colors = {
      plàstic: "bg-yellow-100 text-yellow-800",
      paper: "bg-blue-100 text-blue-800",
      vidre: "bg-green-100 text-green-800",
      metall: "bg-orange-100 text-orange-800",
      orgànic: "bg-amber-100 text-amber-800",
      resta: "bg-gray-100 text-gray-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[material.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
        {material}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
        <FaRecycle className="mr-2 text-green-500" />
        Les Meves Bosses de Reciclatge
      </h2>

      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setCreateBagModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" /> Nova Bossa
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" color="green" />
        </div>
      ) : bags.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bags.map(bag => (
              <div 
                key={bag.id} 
                className={`border rounded-lg p-4 ${bag.reciclada ? 'bg-gray-50' : 'bg-white'} hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      {bag.reciclada ? <FaRecycle className="text-green-500 mr-2" /> : <FaTrash className="text-gray-500 mr-2" />}
                      <h3 className="font-medium">{bag.nombre || `Bossa #${bag.id}`}</h3>
                    </div>
                    <MaterialBadge material={bag.tipo_material.nombre} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(bag.fecha_creacion).toLocaleDateString()}</p>
                    <p className="font-bold text-green-600">{bag.puntos_totales} pts</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-sm text-gray-600">{bag.productos_count} producte(s)</p>
                    {bag.reciclada && (
                      <p className="text-xs text-green-600">Reciclada el {new Date(bag.fecha_reciclaje).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenBag(bag.id)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-sm flex items-center"
                    >
                      <FaBoxOpen className="mr-1" /> Veure
                    </button>
                    {!bag.reciclada && (
                      <button
                        onClick={() => handleRecycleBag(bag.id)}
                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-sm flex items-center"
                      >
                        <FaRecycle className="mr-1" /> Reciclar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FaTrash className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No tens bosses encara</h3>
          <p className="text-gray-500 mb-6">Crea una bossa per començar a acumular productes reciclables</p>
          <button 
            onClick={() => setCreateBagModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg inline-flex items-center"
          >
            <FaPlus className="mr-2" /> Crear primera bossa
          </button>
        </div>
      )}

      {/* Bag Details Modal */}
      {bagDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedBag.nombre || `Bossa #${selectedBag.id}`} 
                <span className="ml-2"><MaterialBadge material={selectedBag.tipo_material.nombre} /></span>
              </h3>
              <button 
                onClick={() => setBagDetails(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data de creació</p>
                  <p>{new Date(selectedBag.fecha_creacion).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estat</p>
                  <p className={selectedBag.reciclada ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                    {selectedBag.reciclada ? "Reciclada" : "Pendent"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Punts totals</p>
                  <p className="font-bold text-green-600">{selectedBag.puntos_totales} punts</p>
                </div>
                {selectedBag.reciclada && selectedBag.fecha_reciclaje && (
                  <div>
                    <p className="text-sm text-gray-500">Reciclada el</p>
                    <p>{new Date(selectedBag.fecha_reciclaje).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <h4 className="font-medium text-lg mb-2 mt-6 border-b pb-2">Productes ({bagDetails.productos.length})</h4>
              
              {bagDetails.productos.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {bagDetails.productos.map(producto => (
                    <div key={producto.id} className="border rounded-lg p-3 flex items-center">
                      {producto.imagen_url ? (
                        <img src={producto.imagen_url} alt={producto.nombre_producto} className="w-16 h-16 object-contain mr-4" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mr-4 rounded">
                          <FaBox className="text-gray-400 text-2xl" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium">{producto.nombre_producto}</h5>
                        <p className="text-sm text-gray-600">{producto.marca}</p>
                        <div className="flex items-center justify-between mt-1">
                          <MaterialBadge material={producto.material.nombre} />
                          <span className="text-green-600 font-medium">{producto.puntos_obtenidos} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aquesta bossa està buida</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                {!selectedBag.reciclada && (
                  <button
                    onClick={() => {
                      setBagDetails(null);
                      handleRecycleBag(selectedBag.id);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <FaRecycle className="mr-2" /> Reciclar aquesta bossa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Bag Modal */}
      {createBagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Crear nova bossa</h3>
              <button 
                onClick={() => setCreateBagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="mb-4 text-gray-600">Selecciona el tipus de material per a aquesta bossa:</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => setNewBagType(1)} // plàstic
                  className={`border p-3 rounded-lg text-center hover:bg-yellow-50 ${newBagType === 1 ? 'bg-yellow-100 border-yellow-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-yellow-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-yellow-600" />
                  </div>
                  <span className="font-medium">Plàstic</span>
                </button>
                
                <button 
                  onClick={() => setNewBagType(2)} // paper
                  className={`border p-3 rounded-lg text-center hover:bg-blue-50 ${newBagType === 2 ? 'bg-blue-100 border-blue-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-blue-600" />
                  </div>
                  <span className="font-medium">Paper/Cartró</span>
                </button>
                
                <button 
                  onClick={() => setNewBagType(3)} // vidre
                  className={`border p-3 rounded-lg text-center hover:bg-green-50 ${newBagType === 3 ? 'bg-green-100 border-green-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-green-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-green-600" />
                  </div>
                  <span className="font-medium">Vidre</span>
                </button>
                
                <button 
                  onClick={() => setNewBagType(4)} // metall (en plàstic)
                  className={`border p-3 rounded-lg text-center hover:bg-orange-50 ${newBagType === 4 ? 'bg-orange-100 border-orange-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-orange-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-orange-600" />
                  </div>
                  <span className="font-medium">Metall</span>
                </button>
                
                <button 
                  onClick={() => setNewBagType(5)} // orgànic
                  className={`border p-3 rounded-lg text-center hover:bg-amber-50 ${newBagType === 5 ? 'bg-amber-100 border-amber-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-amber-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-amber-600" />
                  </div>
                  <span className="font-medium">Orgànic</span>
                </button>
                
                <button 
                  onClick={() => setNewBagType(6)} // rebuig
                  className={`border p-3 rounded-lg text-center hover:bg-gray-50 ${newBagType === 6 ? 'bg-gray-100 border-gray-500' : ''}`}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-2">
                    <FaRecycle className="text-gray-600" />
                  </div>
                  <span className="font-medium">Rebuig</span>
                </button>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCreateBagModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleCreateBag}
                  disabled={!newBagType}
                  className={`px-4 py-2 rounded-lg text-white ${newBagType ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
                >
                  Crear Bossa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bag Modal with Map */}
      {showRecycleModal && selectedBag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center bg-green-50">
              <h3 className="text-lg font-semibold flex items-center">
                <FaRecycle className="text-green-600 mr-2" />
                Reciclar {selectedBag.nombre || `Bossa #${selectedBag.id}`}
              </h3>
              <button 
                onClick={() => setShowRecycleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-800">Anem a reciclar la teva bossa de {selectedBag.tipo_material.nombre}!</p>
                <p className="text-gray-600">Per completar el reciclatge, selecciona un dels contenidors propers al mapa:</p>
              </div>
              
              {/* Añadir un mensaje destacado sobre los puntos */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="flex items-center text-blue-700">
                  <FaInfoCircle className="mr-2" /> 
                  En reciclar aquesta bossa obtindràs els punts acumulats de tots els productes que hi has afegit.
                </p>
              </div>
              
              {loadingContainers ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner size="lg" color="green" />
                </div>
              ) : nearbyContainers.length > 0 ? (
                <div className="h-96 overflow-hidden rounded-lg border mb-4">
                  <MapContainer 
                    center={userLocation || [40.416775, -3.70379]} // Default to Spain if no location
                    zoom={userLocation ? 14 : 6} 
                    style={{ height: '100%', width: '100%' }}
                    doubleClickZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* User location marker */}
                    {userLocation && (
                      <Marker 
                        position={userLocation}
                        icon={new L.Icon({
                          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34]
                        })}
                      >
                        <Popup>La teva ubicació actual</Popup>
                      </Marker>
                    )}
                    
                    {/* Container markers */}
                    {nearbyContainers.map(container => {
                      // Get the right icon or fallback to default
                      const iconKey = container.tipus ? container.tipus.toLowerCase() : 'default';
                      const icon = containerIcons[iconKey] || L.Icon.Default;
                      
                      return (
                        <Marker 
                          key={container.id}
                          position={[container.latitud, container.longitud]}
                          icon={icon}
                          eventHandlers={{
                            click: () => {
                              setSelectedContainer(container);
                            }
                          }}
                        >
                          <Popup>
                            <div>
                              <p className="font-medium">{container.tipus} - {container.id}</p>
                              {userLocation && container.distance && (
                                <p className="text-sm text-gray-600">
                                  Distància: {(container.distance).toFixed(2)} km
                                </p>
                              )}
                              <button 
                                className={`mt-2 px-3 py-1 text-sm rounded-md w-full ${
                                  selectedContainer?.id === container.id 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                                onClick={() => setSelectedContainer(container)}
                              >
                                {selectedContainer?.id === container.id ? 'Seleccionat' : 'Seleccionar'}
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                  <p className="text-yellow-700">
                    No s'han trobat contenidors de {selectedBag.tipo_material.nombre} a prop de la teva ubicació. 
                    Si us plau, cerca un contenidor manualment.
                  </p>
                </div>
              )}
              
              {/* Selected container info */}
              {selectedContainer && (
                <div className="border p-4 rounded-lg bg-gray-50 mb-4">
                  <p className="font-medium text-lg">Contenidor seleccionat:</p>
                  <div className="flex items-center mt-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FaMapMarkerAlt className="text-gray-700" />
                    </div>
                    <div>
                      <p>Contenidor #{selectedContainer.id} - {selectedContainer.tipus}</p>
                      <p className="text-sm text-gray-600">{selectedContainer.ciutat}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="flex items-center font-medium">
                  <FaRecycle className="text-green-600 mr-2" /> 
                  En reciclar aquesta bossa obtindràs <span className="font-bold text-green-600 ml-1">{selectedBag.puntos_totales} punts</span>
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRecycleModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={handleCompleteRecycle}
                  disabled={!selectedContainer}
                  className={`px-6 py-2 rounded-lg text-white flex items-center ${
                    selectedContainer ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <FaRecycle className="mr-2" /> Completar Reciclatge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
