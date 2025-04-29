import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { containerIcon, zoneIcon } from './icons';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

const DEFAULT_POSITION = { lat: 41.9300, lng: 1.7000 }; // Centro de Catalunya

function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 12);
  }, [center, map]);
  return null;
}

export function MapView({ filters, contenedores: propContenedores = [], zonas: propZonas = [] }) {
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isSuperAdmin, isGestor } = usePermissions();

  // Determinar qué contenido debe mostrarse basado en permisos
  const canViewAllContent = isAdmin || isSuperAdmin || isGestor;
  
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

  useEffect(() => {
    let isMounted = true;

    const fetchUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (isMounted) {
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
              setLoadingLocation(false);
            }
          },
          async () => {
            if (user?.CP && user?.location) {
              const location = await geocodeCP(user.CP, user.location);
              if (isMounted) {
                setUserLocation(location || DEFAULT_POSITION);
                setLoadingLocation(false);
              }
            } else {
              if (isMounted) {
                setUserLocation(DEFAULT_POSITION);
                setLoadingLocation(false);
              }
            }
          }
        );
      } else {
        if (isMounted) {
          setUserLocation(DEFAULT_POSITION);
          setLoadingLocation(false);
        }
      }
    };

    fetchUserLocation();

    return () => {
      isMounted = false;
    };
  }, [user?.CP, user?.location, geocodeCP]);

  // Filtrar contenedores según si son públicos o no
  // Modificado: Ahora solo incluye contenedores que NO pertenecen a una zona
  const filteredContenedores = useMemo(() => {
    return propContenedores.filter(c => {
      // Verificación básica
      if (!c || !c.latitud || !c.longitud) return false;
      
      // Ignorar contenedores que pertenecen a una zona
      if (c.zona) return false;
      
      // Filtrar por visibilidad pública si el usuario no está autenticado o no tiene permisos especiales
      if (!canViewAllContent && c.is_private) return false;
      
      // Aplicar filtros del usuario
      return (
        filters.showContenedores &&
        (!filters.ciutat || c.ciutat === filters.ciutat) &&
        (!filters.zona || c.zona?.toString() === filters.zona.toString()) &&
        (!filters.estat || c.estat === filters.estat) &&
        (!filters.tipus || c.tipus === filters.tipus) &&
        (!filters.codi || c.cod?.toString().includes(filters.codi.toString()))
      );
    });
  }, [propContenedores, filters, canViewAllContent]);

  // Filtrar zonas según si son públicas o no
  const filteredZonas = useMemo(() => {
    return propZonas.filter(z => {
      // Verificación básica
      if (!z || !z.latitud || !z.longitud) return false;
      
      // Filtrar por visibilidad pública si el usuario no está autenticado o no tiene permisos especiales
      if (!canViewAllContent && z.is_private) return false;
      
      // Aplicar filtros del usuario
      return (
        filters.showZones &&
        (!filters.ciutat || z.ciutat === filters.ciutat) &&
        (!filters.nom || z.nom?.toString().includes(filters.nom.toString()))
      );
    });
  }, [propZonas, filters, canViewAllContent]);

  // Agrupar contenedores por zona
  const contenedoresPorZona = useMemo(() => {
    const zonasMap = {};
    
    // Solo incluir contenedores que el usuario tiene permiso para ver
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

  const renderContenedorItem = (contenedor) => (
    <div key={contenedor.id} className="border-b border-gray-200 py-2 last:border-b-0">
      <div className="font-medium text-gray-800">{contenedor.nom || contenedor.cod}</div>
      <div className={`text-sm ${
        contenedor.estat === 'buit' ? 'text-green-600' :
        contenedor.estat === 'mig' ? 'text-yellow-600' :
        contenedor.estat === 'ple' ? 'text-red-600' : 'text-gray-600'
      }`}>
        Estat: {contenedor.estat}
      </div>
      {contenedor.tipus && <div className="text-xs text-gray-600">Tipus: {contenedor.tipus}</div>}
      {canViewAllContent && contenedor.is_private && (
        <div className="mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Privat</div>
      )}
    </div>
  );

  const renderContenedorPopup = (contenedor) => (
    <div className="p-3 rounded shadow-lg bg-white text-gray-800 max-w-xs">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{contenedor.nom || contenedor.cod}</h3>
      <p className={`font-medium mb-1 ${
        contenedor.estat === 'buit' ? 'text-green-600' :
        contenedor.estat === 'mig' ? 'text-yellow-600' :
        contenedor.estat === 'ple' ? 'text-red-600' : 'text-gray-600'
      }`}>
        Estat: {contenedor.estat}
      </p>
      {contenedor.ciutat && <p className="text-sm text-gray-700">Ciutat: {contenedor.ciutat}</p>}
      {contenedor.tipus && <p className="text-sm text-gray-700">Tipus: {contenedor.tipus}</p>}
      {canViewAllContent && contenedor.is_private && (
        <div className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Privat</div>
      )}
    </div>
  );

  const MarkerList = ({ items, icon, renderPopup, isZone }) => (
    <>
      {items.map(item => (
        <Marker
          key={`${item.id}-${item.latitud}-${item.longitud}`}
          position={[parseFloat(item.latitud), parseFloat(item.longitud)]}
          icon={icon}
          eventHandlers={{ 
            click: () => {
              // Para zonas, solo mostrar el panel lateral
              if (isZone) {
                setSelectedInfo(item);
              }
            } 
          }}
        >
          {/* Solo mostrar popup para contenedores individuales */}
          {!isZone && <Popup>{renderPopup(item)}</Popup>}
        </Marker>
      ))}
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

  // Determinar si se debe mostrar el panel lateral
  const showSidebar = selectedInfo && selectedInfo.hasOwnProperty('nom') && !selectedInfo.hasOwnProperty('estat');
  const zonaSelected = showSidebar ? selectedInfo : null;
  
  // Determinar si el usuario puede ver los contenedores de esta zona
  const canViewZonaContainers = zonaSelected && (canViewAllContent || !zonaSelected.is_private);
  
  return (
    <div className="w-full flex flex-col items-center">
      {!isAuthenticated && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 p-3 mb-4 rounded-lg">
          <p className="text-sm">
            Estàs veient la vista pública. <a href="/login" className="underline font-medium">Inicia sessió</a> per veure més contingut.
          </p>
        </div>
      )}
      
      <div className="w-full flex flex-col lg:flex-row gap-4">
        <div className={`w-full ${showSidebar ? 'lg:w-2/3' : ''} bg-white rounded-lg shadow-md overflow-hidden`}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={12}
            className="h-96 w-full lg:h-[500px]"
            style={{ borderRadius: "0.5rem" }}
          >
            <CenterMap center={userLocation} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
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
                renderPopup={() => null} // No necesitamos renderizar nada aquí
                isZone={true}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Panel lateral para contenedores por zona */}
        {showSidebar && (
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
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
            
            {canViewZonaContainers ? (
              <div className="mb-4">
                <h4 className="font-medium text-lg border-b border-gray-200 pb-2 mb-2 text-gray-800">
                  Contenidors a la zona
                </h4>
                
                {contenedoresPorZona[zonaSelected.id]?.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto">
                    {contenedoresPorZona[zonaSelected.id].map(contenedor => (
                      <div key={contenedor.id} className="p-3 mb-2 border border-gray-200 rounded bg-gray-50">
                        {renderContenedorItem(contenedor)}
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
      
      {/* Contadores e información adicional */}
      <div className="mt-3 text-sm text-gray-700 flex flex-wrap gap-6">
        {filteredContenedores.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium">{filteredContenedores.length} contenidors individuals visibles</span>
          </div>
        )}
        {filteredZonas.length > 0 && (
          <div className="flex items-center">
            <span className="font-medium">{filteredZonas.length} zones visibles</span>
          </div>
        )}
        
        {isAuthenticated && canViewAllContent && (
          <div className="flex items-center ml-auto">
            <span className="text-xs text-blue-600">Mode administrador: Visualització completa</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(MapView);