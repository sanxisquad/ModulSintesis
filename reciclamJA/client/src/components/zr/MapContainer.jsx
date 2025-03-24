import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from '@react-google-maps/api';
import { getAllContenedors, getAllZones } from '../../api/zr.api';
import { useAuth } from '../../context/AuthContext';

const containerStyle = {
  width: '100%',
  height: '400px',
};

export function MapContainer() {
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 41.3818, lng: 2.1915 });

  const getColor = (estat) => {
    switch (estat) {
      case 'buit': return 'text-green-500';
      case 'mig': return 'text-yellow-500';
      case 'ple': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { user } = useAuth();

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

    if (user?.CP) {
      fetchUserLocation(user.CP);
    }

    fetchContenedores();
    fetchZonas();
  }, [user]);

  const fetchUserLocation = async (cp) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cp},España&key=${apiKey}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setUserLocation({ lat: location.lat, lng: location.lng });
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };

  const onMarkerClick = (item) => {
    setSelectedInfo(item);
    setActiveMarker(item.id);
  };

  const onMapClick = () => {
    setActiveMarker(null);
    setSelectedInfo(null);
  };

  const containerIcon = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  const zoneIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

  return (
    <LoadScriptNext googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={12}
        onClick={onMapClick}
      >
        {contenedores.map((contenedor) => (
          <Marker
            key={contenedor.id}
            position={{ lat: contenedor.latitud, lng: contenedor.longitud }}
            icon={containerIcon}
            onClick={() => onMarkerClick(contenedor)}
          />
        ))}

        {zonas.map((zona) => (
          <Marker
            key={zona.id}
            position={{ lat: zona.latitud, lng: zona.longitud }}
            icon={zoneIcon}
            onClick={() => onMarkerClick(zona)}
          />
        ))}

        {activeMarker && selectedInfo && (
          <InfoWindow
            position={{ lat: selectedInfo.latitud, lng: selectedInfo.longitud }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="infowindow text-black">
              <h3>{selectedInfo.nom || selectedInfo.cod}</h3>
              
              {selectedInfo.hasOwnProperty("estat") ? (
                // Si es un contenedor, mostrar estado con color
                <p className={`font-bold ${getColor(selectedInfo.estat)}`}>
                  Estat: {selectedInfo.estat}
                </p>
              ) : (
                // Si es una zona, mostrar descripción
                <p>Descripción: {selectedInfo.descripcio}</p>
              )}

              {selectedInfo.ciutat && <p>Ciutat: {selectedInfo.ciutat}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScriptNext>
  );
}
