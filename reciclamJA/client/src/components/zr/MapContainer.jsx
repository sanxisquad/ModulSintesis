import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getAllContenedors, getAllZones } from '../../api/zr.api'; // Importamos las funciones para obtener contenedores y zonas

const containerStyle = {
  width: '100%',
  height: '400px',
};

export function MapContainer({ user }) {
  const [contenedores, setContenedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null); // Para mostrar el InfoWindow
  const [selectedInfo, setSelectedInfo] = useState(null); // Información del contenedor o zona seleccionada
  const [userLocation, setUserLocation] = useState({ lat: 41.3818, lng: 2.1915 }); // Coordenadas por defecto

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

    // Si el usuario tiene un código postal, obtener lat y lng
    if (user && user.CP) {
      fetchUserLocation(user.CP);
    }

    fetchContenedores();
    fetchZonas();
  }, [user]);

  const fetchUserLocation = async (cp) => {
    const apiKey = 'AIzaSyB1B4h2flNvIswns3d05CRChnqdx5rFz3k'; // Reemplaza con tu propia clave de API de Google
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cp}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        setUserLocation({ lat: location.lat, lng: location.lng });
      } else {
        console.error('No se pudo obtener la ubicación para este código postal');
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };

  const onMarkerClick = (item) => {
    setSelectedInfo(item); // Establecer la información del contenedor o zona seleccionada
    setActiveMarker(item.id); // Establecer el marcador activo
  };

  // Cerrar el InfoWindow cuando se haga clic fuera de un marcador
  const onMapClick = () => {
    setActiveMarker(null);
    setSelectedInfo(null);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyB1B4h2flNvIswns3d05CRChnqdx5rFz3k">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation} // Usar las coordenadas del usuario
        zoom={12}
        onClick={onMapClick} // Agregar evento de clic en el mapa
      >
        {/* Mostrar los contenedores en el mapa */}
        {contenedores.map((contenedor) => (
          <Marker
            key={contenedor.id}
            position={{ lat: contenedor.latitud, lng: contenedor.longitud }}
            onClick={() => onMarkerClick(contenedor)} // Mostrar la información del contenedor al hacer clic
          />
        ))}

        {/* Mostrar las zonas en el mapa */}
        {zonas.map((zona) => (
          <Marker
            key={zona.id}
            position={{ lat: zona.latitud, lng: zona.longitud }}
            onClick={() => onMarkerClick(zona)} // Mostrar la información de la zona al hacer clic
          />
        ))}

        {/* InfoWindow para mostrar la información cuando se hace clic en un marcador */}
        {activeMarker && selectedInfo && (
          <InfoWindow
            position={{
              lat: selectedInfo.latitud,
              lng: selectedInfo.longitud,
            }}
            onCloseClick={() => setActiveMarker(null)} // Cerrar el InfoWindow
          >
            <div className="infowindow">
              <h3>{selectedInfo.nom || selectedInfo.cod}</h3> {/* Nombre de la zona o contenedor */}
              <p>Latitud: {selectedInfo.latitud}</p>
              <p>Longitud: {selectedInfo.longitud}</p>
              {selectedInfo.ciutat && <p>Ciudad: {selectedInfo.ciutat}</p>}
              {selectedInfo.descripcio && <p>Descripción: {selectedInfo.descripcio}</p>}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
