import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { containerIcon, zoneIcon } from './icons';
import { useAuth } from '../../../hooks/useAuth';

const DEFAULT_POSITION = { lat: 41.9300, lng: 1.7000 }; // Centro de Catalunya

function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 12);
  }, [center, map]);
  return null;
}

export function MapView({ filters, contenedores: propContenedores = [], zonas: propZonas = [] }) {
  const [userLocation, setUserLocation] = useState(null); // empieza como null
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const { user } = useAuth();

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

  const filteredContenedores = useMemo(() => {
    return propContenedores.filter(c =>
      c && c.latitud && c.longitud &&
      filters.showContenedores &&
      (!filters.ciutat || c.ciutat === filters.ciutat) &&
      (!filters.zona || c.zona_id?.toString() === filters.zona.toString()) &&
      (!filters.estat || c.estat === filters.estat) &&
      (!filters.tipus || c.tipus === filters.tipus) &&
      (!filters.codi || c.cod?.toString().includes(filters.codi.toString()))
    );
  }, [propContenedores, filters]);

  const filteredZonas = useMemo(() => {
    return propZonas.filter(z =>
      z && z.latitud && z.longitud &&
      filters.showZones &&
      (!filters.ciutat || z.ciutat === filters.ciutat) &&
      (!filters.nom || z.nom?.toString().includes(filters.nom.toString()))
    );
  }, [propZonas, filters]);

  const renderContenedorPopup = (contenedor) => (
    <div className="p-2 rounded shadow bg-white text-black max-w-xs">
      <h3>{contenedor.nom || contenedor.cod}</h3>
      <p className={`font-bold ${
        contenedor.estat === 'buit' ? 'text-green-500' :
        contenedor.estat === 'mig' ? 'text-yellow-500' :
        contenedor.estat === 'ple' ? 'text-red-500' : 'text-slate-400'
      }`}>
        Estat: {contenedor.estat}
      </p>
      {contenedor.ciutat && <p>Ciutat: {contenedor.ciutat}</p>}
      
    </div>
  );

  const renderZonaPopup = (zona) => (
    <div className="p-2 rounded shadow bg-white text-black max-w-xs">
      <h3>{zona.nom || zona.cod}</h3>
      <p>Descripció: {zona.descripcio}</p>
      {zona.ciutat && <p>Ciutat: {zona.ciutat}</p>}
    </div>
  );

  const MarkerList = ({ items, icon, renderPopup }) => (
    <>
      {items.map(item => (
        <Marker
          key={`${item.id}-${item.latitud}-${item.longitud}`}
          position={[parseFloat(item.latitud), parseFloat(item.longitud)]}
          icon={icon}
          eventHandlers={{ click: () => setSelectedInfo(item) }}
        >
          <Popup>{renderPopup(item)}</Popup>
        </Marker>
      ))}
    </>
  );

  if (loadingLocation || !userLocation) {
    return <div className="text-center p-4">Carregant mapa...</div>;
  }

  return (
    <div className="w-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        className="h-[400px] w-full md:w-[80%]"
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
          />
        )}
        {filteredZonas.length > 0 && (
          <MarkerList
            items={filteredZonas}
            icon={zoneIcon}
            renderPopup={renderZonaPopup}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default React.memo(MapView);
