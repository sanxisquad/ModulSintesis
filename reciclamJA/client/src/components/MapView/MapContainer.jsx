import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllContenedors, getAllZones } from '../../api/zr.api';
import { useAuth } from '../../../hooks/useAuth';
import { DynamicMarkers } from './DynamicMarkers';
import { containerIcon, zoneIcon } from './icons';

const DEFAULT_POSITION = { lat: 41.3818, lng: 2.1915 };

function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], 12);
  }, [center]);
  return null;
}

export function MapView() {
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_POSITION);
  const { user } = useAuth();

  const getColor = useCallback((estat) => {
    switch (estat) {
      case 'buit': return 'text-green-500';
      case 'mig': return 'text-yellow-500';
      case 'ple': return 'text-red-500';
      default: return 'text-slate-400';
    }
  }, []);

  const geocodeCP = useCallback(async (cp) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=España&format=json&limit=1`
      );
      const data = await response.json();
      return data[0] 
        ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } 
        : null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [contenedoresRes, zonasRes] = await Promise.all([
          getAllContenedors({ signal: controller.signal }),
          getAllZones({ signal: controller.signal })
        ]);

        if (isMounted) {
          setContenedores(contenedoresRes.data);
          setZonas(zonasRes.data);
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Error loading data:', error);
      }
    };

    const fetchUserLocation = async () => {
      if (user?.CP) {
        const location = await geocodeCP(user.CP);
        if (location && isMounted) setUserLocation(location);
      }
    };

    fetchData();
    fetchUserLocation();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [user?.CP, geocodeCP]);

  const renderContenedorPopup = useCallback((contenedor) => (
    <div className="infowindow text-black">
      <h3>{contenedor.nom || contenedor.cod}</h3>
      <p className={`font-bold ${getColor(contenedor.estat)}`}>
        Estat: {contenedor.estat}
      </p>
      {contenedor.ciutat && <p>Ciutat: {contenedor.ciutat}</p>}
    </div>
  ), [getColor]);
  
  const renderZonaPopup = useCallback((zona) => (
    <div className="infowindow text-black">
      <h3>{zona.nom || zona.cod}</h3>
      <p>Descripció: {zona.descripcio}</p>
      {zona.ciutat && <p>Ciutat: {zona.ciutat}</p>}
    </div>
  ), []);

  return (
    <div className="w-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
        onClick={() => setSelectedInfo(null)}
      >
        <CenterMap center={userLocation} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <DynamicMarkers
          items={contenedores}
          icon={containerIcon}
          selectedId={selectedInfo?.id}
          onMarkerClick={setSelectedInfo}
          renderPopup={renderContenedorPopup}
        />

        <DynamicMarkers
          items={zonas}
          icon={zoneIcon}
          selectedId={selectedInfo?.id}
          onMarkerClick={setSelectedInfo}
          renderPopup={renderZonaPopup}
        />
      </MapContainer>
    </div>
  );
}