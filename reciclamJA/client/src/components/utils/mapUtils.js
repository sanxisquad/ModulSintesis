import { toast } from 'react-hot-toast';

/**
 * Geocodifica una dirección usando Nominatim
 * @param {string} query - Dirección o búsqueda
 * @returns {Promise<{lat: number, lng: number, address: string, city: string}|null>}
 */
export const geocodeLocation = async (query) => {
  if (!query?.trim()) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
    );
    
    if (!response.ok) throw new Error('Error en la respuesta');
    
    const data = await response.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address: data[0].display_name,
      city: data[0].address.city || data[0].address.town || 
            data[0].address.village || data[0].address.municipality || ''
    };
  } catch (error) {
    console.error('[Geocode Error]', error);
    toast.error('Error al buscar la ubicación');
    return null;
  }
};

/**
 * Geocodificación inversa (coordenadas → dirección)
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<{address: string, city: string}|null>}
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) throw new Error('Error en la respuesta');
    
    const data = await response.json();
    if (!data.address) return null;

    return {
      address: data.display_name,
      city: data.address.city || data.address.town || 
            data.address.village || data.address.municipality || ''
    };
  } catch (error) {
    console.error('[Reverse Geocode Error]', error);
    toast.error('Error al obtener la dirección');
    return null;
  }
};

/**
 * Calcula la distancia en metros entre dos puntos
 * @param {Object} point1 - { lat, lng }
 * @param {Object} point2 - { lat, lng }
 * @returns {number} Distancia en metros
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = point1.lat * Math.PI/180;
  const φ2 = point2.lat * Math.PI/180;
  const Δφ = (point2.lat - point1.lat) * Math.PI/180;
  const Δλ = (point2.lng - point1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};