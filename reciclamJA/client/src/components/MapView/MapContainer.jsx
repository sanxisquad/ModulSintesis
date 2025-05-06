import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { containerIcon, zoneIcon } from './icons';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { createReporte } from '../../api/zr.api';

const DEFAULT_POSITION = { lat: 41.9300, lng: 1.7000 }; // Centro de Catalunya

function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 12);
  }, [center, map]);
  return null;
}

// Componente de formulario para reportar problemas
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
      
      // Campos obligatorios
      reportData.append('tipo', formData.tipo);
      reportData.append('prioridad', formData.prioridad);
      reportData.append('descripcion', formData.descripcion);
      
      // Estos campos son requeridos por el serializer
      reportData.append('tipo_objeto', itemType); // 'contenedor' o 'zona'
      reportData.append('objeto_id', item.id);    // ID del contenedor o zona
      
      // Campo opcional (imagen)
      if (formData.imagen) {
        reportData.append('imagen', formData.imagen);
      }
      
      // Configuración de headers para FormData
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      };
      
      const response = await createReporte(reportData, config);
      
      console.log('Reporte enviado exitosamente:', response);
      alert(`Informe enviat correctament per a ${itemType === 'contenedor' ? 'contenidor' : 'zona'} ${item.nom || item.cod}`);
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
export function MapView({ filters, contenedores: propContenedores = [], zonas: propZonas = [] }) {
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [reportFormOpen, setReportFormOpen] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);
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

  // Función para manejar el reporte de un problema
  const handleReportProblem = (item, type) => {
    // Verificamos si el usuario está autenticado
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para reportar problemas");
      return;
    }
    
    // Abrimos el formulario de reporte
    setReportItem(item);
    setReportItemType(type);
    setReportFormOpen(true);
  };

  // Función para abrir la ubicación en Google Maps
  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

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
      
      {/* Botón para reportar problema con el contenedor */}
      <div className="mt-3 flex justify-end">
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
          {/* Popup para todos los items */}
          <Popup>
            {isZone ? (
              <div className="p-3 rounded shadow-lg bg-white text-gray-800 max-w-xs">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.nom}</h3>
                {item.descripcio && <p className="text-sm text-gray-700 mb-2">{item.descripcio}</p>}
                {item.ciutat && <p className="text-sm text-gray-700">Ciutat: {item.ciutat}</p>}
                
                <div className="mt-3 flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openInGoogleMaps(item.latitud, item.longitud);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Veure en Google Maps
                  </button>
                  
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
              renderPopup(item)
            )}
          </Popup>
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
                renderPopup={() => null}
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
            
            {/* Botón para ver en Google Maps */}
            <div className="mb-4">
              <button 
                onClick={() => openInGoogleMaps(zonaSelected.latitud, zonaSelected.longitud)}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded flex items-center justify-center"
              >
                <span>Veure en Google Maps</span>
              </button>
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
                  <div className="max-h-[400px] overflow-y-auto">
                    {contenedoresPorZona[zonaSelected.id].map(contenedor => (
                      <div key={contenedor.id} className="p-3 mb-2 border border-gray-200 rounded bg-gray-50">
                        {renderContenedorItem(contenedor)}
                        <div className="mt-2 text-right">
                          <button 
                            onClick={() => handleReportProblem(contenedor, 'contenedor')}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center justify-end ml-auto"
                          >
                            <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-solid border-transparent border-b-red-600 mr-1"></div>
                            <span>Reportar</span>
                          </button>
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
      
      {/* Formulario de reporte */}
      <ReporteProblemForm 
        isOpen={reportFormOpen}
        onClose={() => setReportFormOpen(false)}
        item={reportItem}
        itemType={reportItemType}
      />
    </div>
  );
}

export default React.memo(MapView);