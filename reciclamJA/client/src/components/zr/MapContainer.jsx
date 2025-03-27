import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup,
  useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllContenedors, getAllZones } from '../../api/zr.api';
import { useAuth } from '../../../hooks/useAuth';

// Configurar iconos personalizados
const containerIcon = new L.Icon({
  iconUrl: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const zoneIcon = new L.Icon({
  iconUrl: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Posición por defecto (Barcelona)
const DEFAULT_POSITION = {
  lat: 41.3818,
  lng: 2.1915
};

// Componente para centrar el mapa cuando cambia la ubicación del usuario
function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 12);
    }
  }, [center, map]);
  return null;
}

export function MapView() {
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_POSITION);
  const { user } = useAuth();

  const getColor = (estat) => {
    switch (estat) {
      case 'buit': return 'text-green-500';
      case 'mig': return 'text-yellow-500';
      case 'ple': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  // Función para geocodificar usando Nominatim
  const geocodeCP = async (cp) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=España&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  };

  useEffect(() => {
    async function fetchContenedores() {
      try {
        const response = await getAllContenedors();
        setContenedores(response.data);
      } catch (error) {
        console.error('Error al cargar contenedores', error);
      }
    }

    async function fetchZonas() {
      try {
        const response = await getAllZones();
        setZonas(response.data);
      } catch (error) {
        console.error('Error al cargar zonas', error);
      }
    }

    async function fetchUserLocation() {
      if (user?.CP) {
        const location = await geocodeCP(user.CP);
        if (location) {
          setUserLocation(location);
        }
      }
    }

    fetchContenedores();
    fetchZonas();
    fetchUserLocation();
  }, [user]);

  const onMarkerClick = (item) => {
    setSelectedInfo(item);
  };

  const onMapClick = () => {
    setSelectedInfo(null);
  };

  return (
    <div className="w-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
        onClick={onMapClick}
      >
        <CenterMap center={userLocation} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {contenedores.map((contenedor) => (
          <Marker
            key={contenedor.id}
            position={[contenedor.latitud, contenedor.longitud]}
            icon={containerIcon}
            eventHandlers={{
              click: () => onMarkerClick(contenedor)
            }}
          >
            {selectedInfo?.id === contenedor.id && (
              <Popup>
                <div className="infowindow text-black">
                  <h3>{contenedor.nom || contenedor.cod}</h3>
                  <p className={`font-bold ${getColor(contenedor.estat)}`}>
                    Estat: {contenedor.estat}
                  </p>
                  {contenedor.ciutat && <p>Ciutat: {contenedor.ciutat}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}

        {zonas.map((zona) => (
          <Marker
            key={zona.id}
            position={[zona.latitud, zona.longitud]}
            icon={zoneIcon}
            eventHandlers={{
              click: () => onMarkerClick(zona)
            }}
          >
            {selectedInfo?.id === zona.id && (
              <Popup>
                <div className="infowindow text-black">
                  <h3>{zona.nom || zona.cod}</h3>
                  <p>Descripció: {zona.descripcio}</p>
                  {zona.ciutat && <p>Ciutat: {zona.ciutat}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}