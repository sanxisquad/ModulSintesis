import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, ZoomControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { createReporte } from '../../api/zr.api';
import { toast } from 'react-hot-toast';
import { FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';

// Fix for Leaflet's default icon
delete L.Icon.Default.prototype._getIconUrl;

// Direct path to Leaflet's assets
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons with absolute URLs
const containerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const zoneIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'zone-marker' // For custom styling
});

const DEFAULT_POSITION = { lat: 41.9300, lng: 1.7000 }; // Center of Catalonia

// City search component for the map
function MapCitySearch({ onCitySearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [address, setAddress] = useState('');
  const searchRef = useRef(null);

  // Function to geocode a city/address to coordinates
  const geocodeLocation = async (query) => {
    if (!query) return null;
    
    try {
      console.log('[GEOCODE] Searching:', query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name,
          city: data[0].address?.city || data[0].address?.town || 
                data[0].address?.village || data[0].address?.municipality || query
        };
      }
      return null;
    } catch (error) {
      console.error('[ERROR] Geocoding failed:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a city or address');
      return;
    }

    const location = await geocodeLocation(searchTerm);
    
    if (location) {
      setAddress(location.address);
      onCitySearch(location);
    } else {
      toast.error('Location not found');
    }
  };

  return (
    <div className="leaflet-top leaflet-center" ref={searchRef}>
      <div className="leaflet-control leaflet-bar" style={{marginTop: "10px"}}>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64 md:w-80 mt-4 mx-auto">
          <div className="flex">
            <div className="bg-gray-100 p-2 flex items-center justify-center">
              <FaMapMarkerAlt className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Cercar ciutat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 focus:outline-none text-gray-700"
            />
            <button 
              onClick={handleSearch}
              className="bg-blue-500 text-white p-2 flex items-center justify-center hover:bg-blue-600"
            >
              <FaSearch className="text-white" />
            </button>
          </div>
          {address && (
            <div className="text-xs bg-gray-50 px-3 py-1 border-t border-gray-200">
              {address}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Center map based on coordinates
function CenterMapOnCoordinates({ centerCoordinates }) {
  const map = useMap();
  
  useEffect(() => {
    if (centerCoordinates) {
      map.flyTo([centerCoordinates.lat, centerCoordinates.lng], 13);
    }
  }, [centerCoordinates, map]);
  
  return null;
}

// Main component
export function HomeMapView({ contenedores: propContenedores = [], zonas: propZonas = [] }) {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);
  const [centerCoordinates, setCenterCoordinates] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isSuperAdmin, isGestor } = usePermissions();
  const mapRef = useRef(null);

  // Determine what content should be displayed based on permissions
  const canViewAllContent = isAdmin || isSuperAdmin || isGestor;
  const canNavigateToDetails = isAdmin || isSuperAdmin || isGestor;
  
  // Handle city search results
  const handleCitySearch = (location) => {
    console.log("City search result:", location);
    setCenterCoordinates({
      lat: location.lat,
      lng: location.lng
    });
  };

  // Geocode a postal code
  const geocodeCP = useCallback(async (cp, location) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cp}&city=${location}&country=España&format=json&limit=1`
      );
      const data = await response.json();
      return data[0]
        ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        : null;
    } catch (error) {
      console.error('Error geocoding CP:', error);
      return null;
    }
  }, []);

  // Get user location on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (isMounted) {
              const coordinates = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              };
              setUserLocation(coordinates);
              setCenterCoordinates(coordinates);
              setLoadingLocation(false);
            }
          },
          async () => {
            if (user?.CP && user?.location) {
              const location = await geocodeCP(user.CP, user.location);
              if (isMounted) {
                const coordinates = location || DEFAULT_POSITION;
                setUserLocation(coordinates);
                setCenterCoordinates(coordinates);
                setLoadingLocation(false);
              }
            } else {
              if (isMounted) {
                setUserLocation(DEFAULT_POSITION);
                setCenterCoordinates(DEFAULT_POSITION);
                setLoadingLocation(false);
              }
            }
          }
        );
      } else {
        if (isMounted) {
          setUserLocation(DEFAULT_POSITION);
          setCenterCoordinates(DEFAULT_POSITION);
          setLoadingLocation(false);
        }
      }
    };

    fetchUserLocation();

    return () => {
      isMounted = false;
    };
  }, [user?.CP, user?.location, geocodeCP]);

  // Filter containers based on visibility
  const filteredContenedores = useMemo(() => {
    return propContenedores.filter(c => {
      // Basic verification
      if (!c || !c.latitud || !c.longitud) return false;
      
      // Ignore containers that belong to a zone
      if (c.zona) return false;
      
      // Filter by public visibility if user is not authenticated or doesn't have special permissions
      if (!canViewAllContent && c.is_private) return false;
      
      return true;
    });
  }, [propContenedores, canViewAllContent]);

  // Filter zones based on visibility
  const filteredZonas = useMemo(() => {
    return propZonas.filter(z => {
      // Basic verification
      if (!z || !z.latitud || !z.longitud) return false;
      
      // Filter by public visibility if user is not authenticated or doesn't have special permissions
      if (!canViewAllContent && z.is_private) return false;
      
      return true;
    });
  }, [propZonas, canViewAllContent]);

  // Group containers by zone
  const contenedoresPorZona = useMemo(() => {
    const zonasMap = {};
    
    // Only include containers that the user has permission to see
    const contenedoresVisibles = propContenedores.filter(c => 
      canViewAllContent || !c.is_private
    );
    
    contenedoresVisibles.forEach(contenedor => {
      if (contenedor.zona) {
        const zonaId = contenedor.zona.toString();
        if (!zonasMap[zonaId]) {
          zonasMap[zonaId] = [];
        }
        zonasMap[zonaId].push(contenedor);
      }
    });
    
    return zonasMap;
  }, [propContenedores, canViewAllContent]);

  // Function to handle reporting a problem
  const handleReportProblem = (item, type) => {
    // Verify if user is authenticated
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para reportar problemas");
      return;
    }
    
    // Open the report form
    setReportItem(item);
    setReportItemType(type);
    setReportFormOpen(true);
  };

  // Function to navigate to details page
  const navigateToDetail = (item, type) => {
    if (type === 'contenedor') {
      navigate(`/contenedor/${item.id}`);
    } else if (type === 'zona') {
      navigate(`/zona/${item.id}`);
    }
  };

  // Function to open location in Google Maps
  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Function to get container type color
  const getTipusColor = (tipus) => {
    switch (tipus) {
      case 'paper': return 'bg-blue-500';
      case 'plàstic': return 'bg-yellow-500';
      case 'vidre': return 'bg-green-500';
      case 'orgànic': return 'bg-amber-500';
      case 'rebuig': 
      case 'indiferenciat': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Function to get text color for type
  const getTipusTextColor = (tipus) => {
    switch (tipus) {
      case 'paper': return 'text-blue-800';
      case 'plàstic': return 'text-yellow-800';
      case 'vidre': return 'text-green-800';
      case 'orgànic': return 'text-amber-800';
      case 'rebuig': 
      case 'indiferenciat': return 'text-gray-800';
      default: return 'text-gray-800';
    }
  };

  // Function to capitalize first letter of container type
  const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };

  // Render container item in the sidebar
  const renderContenedorItem = (contenedor) => (
    <div key={contenedor.id} className="border-b border-gray-200 py-2 last:border-b-0">
      <div className="flex items-center">
        {/* Add color indicator for container type */}
        <div className={`w-3 h-3 rounded-full mr-2 ${getTipusColor(contenedor.tipus)}`}></div>
        <div className="font-medium text-gray-800">{capitalizeFirstLetter(contenedor.tipus) || 'Contenidor'}</div>
      </div>
      <div className={`text-sm ${
        contenedor.estat === 'buit' ? 'text-green-600' :
        contenedor.estat === 'mig' ? 'text-yellow-600' :
        contenedor.estat === 'ple' ? 'text-red-600' : 'text-gray-600'
      }`}>
        Estat: {contenedor.estat}
      </div>
      {canViewAllContent && contenedor.is_private && (
        <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Privat</div>
      )}
    </div>
  );

  // Render container popup on the map
  const renderContenedorPopup = (contenedor) => (
    <div className="p-3 rounded shadow-lg bg-white text-gray-800 max-w-xs">
      <div className={`h-1.5 -mt-3 -mx-3 mb-3 rounded-t ${getTipusColor(contenedor.tipus)}`}></div>
      
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getTipusColor(contenedor.tipus)}`}></div>
          {capitalizeFirstLetter(contenedor.tipus) || 'Contenidor'}
        </div>
      </h3>
      <p className={`font-medium mb-1 ${
        contenedor.estat === 'buit' ? 'text-green-600' :
        contenedor.estat === 'mig' ? 'text-yellow-600' :
        contenedor.estat === 'ple' ? 'text-red-600' : 'text-gray-600'
      }`}>
        Estat: {contenedor.estat}
      </p>
      {contenedor.ciutat && <p className="text-sm text-gray-700">Ciutat: {contenedor.ciutat}</p>}
      {/* Add zone info if assigned */}
      {contenedor.zona && contenedor.zona_nombre && (
        <p className="text-sm text-gray-700">
          Zona: <span className="font-medium">{contenedor.zona_nombre}</span>
        </p>
      )}
      {canViewAllContent && contenedor.is_private && (
        <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Privat</div>
      )}
      
      <div className="mt-3 flex justify-between">
        {/* Show different buttons based on user role */}
        {canNavigateToDetails ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigateToDetail(contenedor, 'contenedor');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Veure detalls
          </button>
        ) : (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              openInGoogleMaps(contenedor.latitud, contenedor.longitud);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Veure en Google Maps
          </button>
        )}

        {/* Button to report a problem with the container */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleReportProblem(contenedor, 'contenedor');
          }}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-solid border-transparent border-b-red-600 mr-1"></div>
          <span className="text-sm">Reportar problema</span>
        </button>
      </div>
    </div>
  );

  // Component to render markers on the map - simplified to fix marker display issues
  const MarkerList = ({ items, icon, renderPopup, isZone }) => (
    <>
      {items.map(item => {
        // Ensure we have valid coordinates
        if (!item.latitud || !item.longitud) return null;
        
        // Convert strings to floats and validate coordinates
        const lat = parseFloat(item.latitud);
        const lng = parseFloat(item.longitud);
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return (
          <Marker
            key={`${item.id}-${lat}-${lng}`}
            position={[lat, lng]}
            icon={icon} // Use the directly provided icon
            eventHandlers={{ 
              click: () => {
                // For zones, show the side panel
                if (isZone) {
                  setSelectedInfo(item);
                }
              } 
            }}
          >
            <Popup>
              {isZone ? (
                // Zone popup content 
                <div className="p-3 rounded shadow-lg bg-white text-gray-800 max-w-xs">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.nom}</h3>
                  {item.descripcio && <p className="text-sm text-gray-700 mb-2">{item.descripcio}</p>}
                  {item.ciutat && <p className="text-sm text-gray-700">Ciutat: {item.ciutat}</p>}
                  
                  <div className="mt-3 flex justify-between">
                    {canNavigateToDetails ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToDetail(item, 'zona');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Veure detalls
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openInGoogleMaps(item.latitud, item.longitud);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Veure en Google Maps
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportProblem(item, 'zona');
                      }}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-solid border-transparent border-b-red-600 mr-1"></div>
                      <span className="text-sm">Reportar</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Container popup content
                renderPopup(item)
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );

  if (loadingLocation || !userLocation) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow-sm">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregant mapa...</p>
        </div>
      </div>
    );
  }

  // Determine if the sidebar should be shown
  const showSidebar = selectedInfo && selectedInfo.hasOwnProperty('nom') && !selectedInfo.hasOwnProperty('estat');
  const zonaSelected = showSidebar ? selectedInfo : null;
  
  // Determine if the user can view containers in this zone
  const canViewZonaContainers = zonaSelected && (canViewAllContent || !zonaSelected.is_private);
  
  return (
    <div className="w-full flex flex-col items-center">
      {/* Removed authentication message */}
      
      {/* Fix the layout to prevent the blank space issue */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map section - always takes full width on mobile, 2/3 on desktop when sidebar is visible */}
        <div className={`${showSidebar ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-lg shadow-md overflow-hidden relative h-[500px]`} style={{ zIndex: 1 }}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={12}
            className="w-full h-full"
            style={{ borderRadius: "0.5rem", zIndex: 1 }}
            zoomControl={false}
            ref={mapRef}
          >
            {/* City search component inside the map */}
            <MapCitySearch onCitySearch={handleCitySearch} />
            
            {/* Component to center map on searched city */}
            <CenterMapOnCoordinates centerCoordinates={centerCoordinates} />
            
            {/* Base map tile layer */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Place ZoomControl on the right side */}
            <ZoomControl position="topright" />
            
            {/* Map markers */}
            {filteredContenedores.length > 0 && (
              <MarkerList
                items={filteredContenedores}
                icon={containerIcon}
                renderPopup={renderContenedorPopup}
                isZone={false}
              />
            )}
            {filteredZonas.length > 0 && (
              <MarkerList
                items={filteredZonas}
                icon={zoneIcon}
                renderPopup={() => null}
                isZone={true}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Sidebar panel for zone containers - only takes up space when visible */}
        {showSidebar && (
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 overflow-hidden h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10">
              <h3 className="text-xl font-semibold text-gray-800">{zonaSelected.nom || zonaSelected.cod}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedInfo(null)}
              >
                ✕
              </button>
            </div>
            
            {zonaSelected.descripcio && (
              <p className="text-sm text-gray-600 mb-4">{zonaSelected.descripcio}</p>
            )}
            
            {zonaSelected.ciutat && (
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Ciutat:</span> {zonaSelected.ciutat}
              </p>
            )}
            
            {canViewAllContent && zonaSelected.is_private && (
              <div className="mb-4 text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded">
                <span className="font-medium">Visibilitat:</span> Privada
              </div>
            )}
            
            {/* Botón que cambia según el rol del usuario */}
            <div className="mb-4">
              {canNavigateToDetails ? (
                <button 
                  onClick={() => navigateToDetail(zonaSelected, 'zona')}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded flex items-center justify-center"
                >
                  <span>Veure detalls de la zona</span>
                </button>
              ) : (
                <button 
                  onClick={() => openInGoogleMaps(zonaSelected.latitud, zonaSelected.longitud)}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded flex items-center justify-center"
                >
                  <span>Veure en Google Maps</span>
                </button>
              )}
            </div>
            
            {/* Botón para reportar un problema */}
            <div className="mb-4">
              <button 
                onClick={() => handleReportProblem(zonaSelected, 'zona')}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded flex items-center justify-center"
              >
                <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-solid border-transparent border-b-red-600 mr-2"></div>
                <span>Reportar problema</span>
              </button>
            </div>
            
            {canViewZonaContainers ? (
              <div className="mb-4">
                <h4 className="font-medium text-lg border-b border-gray-200 pb-2 mb-2 text-gray-800">
                  Contenidors a la zona
                </h4>
                
                {contenedoresPorZona[zonaSelected.id]?.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {contenedoresPorZona[zonaSelected.id].map(contenedor => (
                      <div key={contenedor.id} className="p-3 mb-2 border border-gray-200 rounded bg-gray-50 relative">
                        {/* Color stripe based on container type */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l ${getTipusColor(contenedor.tipus)}`}></div>
                        <div className="pl-1.5">
                          {renderContenedorItem(contenedor)}
                          <div className="mt-2 flex justify-between">
                            {/* Direct navigation for managers and admins */}
                            {canNavigateToDetails && (
                              <button 
                                onClick={() => navigateToDetail(contenedor, 'contenedor')}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Veure detalls
                              </button>
                            )}
                            <button 
                              onClick={() => handleReportProblem(contenedor, 'contenedor')}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center ml-auto"
                            >
                              <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-solid border-transparent border-b-red-600 mr-1"></div>
                              <span>Reportar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 italic">No hi ha contenidors assignats a aquesta zona</p>
                )}
              </div>
            ) : (
              <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-700">
                  Inicia sessió per veure més informació sobre aquesta zona.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Report problem form */}
      {reportFormOpen && (
        <ReporteProblemForm 
          isOpen={reportFormOpen}
          onClose={() => setReportFormOpen(false)}
          item={reportItem}
          itemType={reportItemType}
        />
      )}
    </div>
  );
}

// Component to report problems - Fixed with Catalan translations
function ReporteProblemForm({ isOpen, onClose, item, itemType }) {
  const [formData, setFormData] = useState({
    tipo: 'mal_estado',
    prioridad: 'media',
    descripcion: '',
    imagen: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Reset form when new item is selected
  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo: 'mal_estado',
        prioridad: 'media',
        descripcion: '',
        imagen: null
      });
      setPreviewImage(null);
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  // Translated options to Catalan
  const TIPO_REPORTE = [
    ['mal_estado', 'Contenidor en mal estat'],
    ['lleno', 'Contenidor ple'],
    ['vandalismo', 'Vandalisme'],
    ['ubicacion', 'Problema amb la ubicació'],
    ['olores', 'Mals olors'],
    ['otro', 'Altre problema']
  ];

  const PRIORIDAD_REPORTE = [
    ['baja', 'Baixa'],
    ['media', 'Mitjana'],
    ['alta', 'Alta'],
    ['urgente', 'Urgent']
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const reportData = new FormData();
      
      // Required fields
      reportData.append('tipo', formData.tipo);
      reportData.append('prioridad', formData.prioridad);
      reportData.append('descripcion', formData.descripcion);
      
      // These fields are required by the serializer
      reportData.append('tipo_objeto', itemType); // 'contenedor' or 'zona'
      reportData.append('objeto_id', item.id);    // ID of container or zone
      
      // Optional field (image)
      if (formData.imagen) {
        reportData.append('imagen', formData.imagen);
      }
      
      // Headers configuration for FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      };
      
      const response = await createReporte(reportData, config);
      
      console.log('Reporte enviado exitosamente:', response);
      toast.success(`Informe enviat correctament per a ${itemType === 'contenedor' ? 'contenidor' : 'zona'} ${item.nom || item.cod}`);
      setIsSubmitting(false);
      onClose();
      
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      setError(error.response?.data?.message || 'Error en enviar l\'informe. Si us plau, torneu-ho a provar.');
      setIsSubmitting(false);
    }
  };
  
  // Portal style rendering for z-index issues
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      zIndex: 10000000, // Extremely high z-index
      pointerEvents: 'auto'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '28rem',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative', // Ensure it's positioned
        zIndex: 10000001 // Even higher z-index
      }}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Informar problema: {item?.nom || item?.cod}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              style={{zIndex: 10000002}} // Ensure clickable
            >
              ✕
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipus de problema
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-800 bg-white"
                required
              >
                {TIPO_REPORTE.map(([value, label]) => (
                  <option key={value} value={value} className="text-gray-800">{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioritat
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-gray-800 bg-white"
                required
              >
                {PRIORIDAD_REPORTE.map(([value, label]) => (
                  <option key={value} value={value} className="text-gray-800">{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripció del problema
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Descriu el problema amb detall..."
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imatge (opcional)
              </label>
              <input
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {previewImage && (
                <div className="mt-2">
                  <img 
                    src={previewImage} 
                    alt="Vista prèvia" 
                    className="h-32 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
                style={{zIndex: 10000002}} // Ensure clickable
              >
                {isSubmitting ? 'Enviant...' : 'Enviar informe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add a special style for zone markers
// You can add this to your CSS file
const style = document.createElement('style');
style.textContent = `
  .zone-marker {
    filter: hue-rotate(120deg); /* Make zones appear in a different color */
  }
`;
document.head.appendChild(style);

export default React.memo(HomeMapView);
