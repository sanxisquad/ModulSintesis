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
import { toast } from 'react-hot-toast';

// Coordenadas por defecto (centro de Cataluña)
const DEFAULT_POSITION = {
  lat: 41.5912, 
  lng: 1.5209
};

export function MapPicker({ onLocationSelect, initialLat, initialLng, onCitySelect, empresa }) {
    const [position, setPosition] = useState(DEFAULT_POSITION);
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

    // Función para geocodificación
    const geocodeLocation = useCallback(async (query) => {
        if (!query) return null;
        
        try {
            console.log('[GEOCODE] Buscando:', query);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
            );
            const data = await response.json();
            console.log('[GEOCODE] Resultado:', data);

            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                    address: data[0].display_name,
                    city: data[0].address.city || data[0].address.town || 
                          data[0].address.village || data[0].address.municipality || ''
                };
            }
            return null;
        } catch (error) {
            console.error('[ERROR] Geocodificación fallida:', error);
            return null;
        }
    }, []);

    // Función para geocodificación inversa
    const reverseGeocode = async (lat, lng) => {
        try {
            console.log('[REVERSE] Buscando:', lat, lng);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            console.log('[REVERSE] Resultado:', data);
            
            if (data.address) {
                return {
                    address: data.display_name,
                    city: data.address.city || data.address.town || 
                          data.address.village || data.address.municipality || ''
                };
            }
        } catch (error) {
            console.error('[ERROR] Reverse geocode fallido:', error);
        }
        return null;
    };

    // Carga inicial del mapa
    useEffect(() => {
        // Si aún no tenemos coordenadas válidas, esperamos a que se carguen los datos
        if (!initialLat || !initialLng) {
            console.log('[INIT] Esperando a que se carguen los datos...');
            return;
        }
    
        const initializeMap = async () => {
            console.log('[INIT] Inicializando mapa con:', {
                initialLat,
                initialLng,
                empresa: {
                    cp: empresa?.cp,
                    direccio: empresa?.direccio
                }
            });
    
            let finalPosition = {
                lat: initialLat,
                lng: initialLng
            };
    
            if (initialLat !== 0 && initialLng !== 0) {
                console.log('[INIT] Usando coordenadas iniciales');
                const result = await reverseGeocode(initialLat, initialLng);
                
                if (result) {
                    finalPosition.city = result.city;
                    finalPosition.address = result.address;
                }
            } else if (empresa?.cp && empresa?.direccio) {
                console.log('[INIT] Buscando con CP + dirección');
                const query = `${empresa.cp}, ${empresa.direccio}`;
                const location = await geocodeLocation(query);
                
                if (location) {
                    finalPosition = location;
                }
            } else if (empresa?.direccio) {
                console.log('[INIT] Buscando solo con dirección');
                const location = await geocodeLocation(empresa.direccio);
                
                if (location) {
                    finalPosition = location;
                }
            } else {
                console.log('[INIT] Usando posición por defecto (Cataluña)');
                finalPosition = DEFAULT_POSITION;
                setCity('Cataluña');
                setAddress('Cataluña, España');
            }
    
            updatePosition(finalPosition);
    
            // Mover la vista del mapa al marcador
            if (mapRef.current) {
                mapRef.current.flyTo([finalPosition.lat, finalPosition.lng], 12);
            }
        };
    
        initializeMap();
    }, [initialLat, initialLng, empresa]);

    const updatePosition = (location) => {
        setPosition({ lat: location.lat, lng: location.lng });
        setCity(location.city || '');
        setAddress(location.address || '');
        
        if (onLocationSelect) onLocationSelect(location.lat, location.lng);
        if (onCitySelect) onCitySelect(location.city || '');
        
        if (mapRef.current) {
            mapRef.current.flyTo([location.lat, location.lng], 12);
        }
    };

    const handleMapClick = useCallback(async (e) => {
        const { lat, lng } = e.latlng;
        const result = await reverseGeocode(lat, lng);
        
        if (result) {
            updatePosition({
                lat,
                lng,
                ...result
            });
        }
    }, [onLocationSelect, onCitySelect]);

    const handleSearch = async () => {
        if (!city.trim()) {
            toast.error('Por favor ingresa una ciudad o dirección');
            return;
        }

        console.log('[SEARCH] Buscando:', city);
        const location = await geocodeLocation(city);
        
        if (location) {
            updatePosition(location);
        } else {
            toast.error('No se encontró la ubicación');
        }
    };

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
                    {position.lat !== DEFAULT_POSITION.lat && position.lng !== DEFAULT_POSITION.lng && (
                        <Marker position={[position.lat, position.lng]}>
                            <Popup>
                                <div>
                                    <p className="font-semibold">Ubicación seleccionada</p>
                                    {address && <p className="text-sm">{address}</p>}
                                </div>
                            </Popup>
                        </Marker>
                    )}
                    <MapClickHandler onClick={handleMapClick} />
                </MapContainer>
            </div>
        </div>
    );
}

function MapClickHandler({ onClick }) {
    useMapEvents({
        click: onClick
    });
    return null;
}