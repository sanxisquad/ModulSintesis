import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast'; // Usamos react-hot-toast en lugar de react-toastify

export function MapPicker({ onLocationSelect, initialLat, initialLng, onCitySelect }) {
    const [position, setPosition] = useState({
        lat: initialLat || 40.730610,
        lng: initialLng || -73.935242
    });
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const mapRef = useRef(null);

    // Componente para controlar el mapa
    const MapController = () => {
        const map = useMap();
        
        useEffect(() => {
            mapRef.current = map;
            return () => { mapRef.current = null };
        }, [map]);

        return null;
    };

    const handleMapClick = useCallback(async (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        
        try {
            // Realiza la geocodificación inversa usando las coordenadas lat y lon
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            
            if (data.address) {
                // Extrae la ciudad y dirección
                const cityName = data.address.city || data.address.town || data.address.village || '';
                const displayAddress = data.display_name || '';
                
                // Actualiza la ciudad y la dirección en el estado
                setCity(cityName);
                setAddress(displayAddress);
                
                // Llama al callback para actualizar la ciudad
                if (onCitySelect) {
                    onCitySelect(cityName);
                }
            }
    
            // Pasa las coordenadas seleccionadas al callback onLocationSelect
            if (onLocationSelect) {
                onLocationSelect(lat, lng);
            }
        } catch (error) {
            console.error('Error al obtener la dirección:', error);
            toast.error('No se pudo obtener la dirección de esta ubicación');
        }
    }, [onLocationSelect, onCitySelect]);

    const handleSearch = async () => {
        if (!city) {
            toast.error('Por favor ingresa una ciudad o dirección');
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${city}&format=json&addressdetails=1`
            );
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newPosition = { 
                    lat: parseFloat(lat), 
                    lng: parseFloat(lon) 
                };
                
                setPosition(newPosition);
                setAddress(display_name);
                if (onLocationSelect) onLocationSelect(newPosition.lat, newPosition.lng);
                
                if (mapRef.current) {
                    mapRef.current.flyTo([newPosition.lat, newPosition.lng], 12);
                }
            } else {
                toast.error('Ubicación no encontrada');
            }
        } catch (error) {
            console.error('Error al buscar:', error);
            toast.error('Error al buscar la ubicación');
        }
    };

    const handleMarkerClick = useCallback(async () => {
        try {
            // Realizar la búsqueda inversa para obtener la dirección
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
            );
            const data = await response.json();
            
            if (data.address) {
                const cityName = data.address.city || data.address.town || data.address.village || '';
                setCity(cityName);
                setAddress(data.display_name || '');
            }
        } catch (error) {
            console.error('Error al obtener dirección del marcador:', error);
            toast.error('No se pudo obtener la dirección del marcador');
        }
    }, [position]);

    return (
        <div className="w-full">
            <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Buscar ubicación</label>
                <div className="flex">
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md flex-grow"
                        placeholder="Escribe una ciudad o dirección"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        type="button"
                        className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Buscar
                    </button>
                </div>
                {address && (
                    <div className="mt-1 text-sm text-gray-500">
                        {address}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={12}
                    style={{ height: '400px', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <MapController />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[position.lat, position.lng]} eventHandlers={{ click: handleMarkerClick }}>
                        <Popup>
                            <div>
                                <p className="font-semibold">Ubicación seleccionada</p>
                                {address && <p className="text-sm">{address}</p>}
                            </div>
                        </Popup>
                    </Marker>
                    <MapClickHandler onClick={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onClick }) {
    useMapEvents({
        click: onClick
    });
    return null;
}
