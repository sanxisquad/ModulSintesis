import React, { useEffect, useMemo, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';

export const DynamicMarkers = ({
  items,
  icon,
  selectedId,
  onMarkerClick,
  renderPopup,
  zoomLevel = 12 // Nivel de zoom por defecto
}) => {
  const map = useMap();
  const markerRefs = useRef(new Map());
  const initialRenderRef = useRef(true);
  
  // Asegurar que los marcadores se muestran al inicio y cuando cambian los items
  useEffect(() => {
    console.log(`DynamicMarkers: Rendering ${items.length} items`);
    
    // Primera renderización: aplicar múltiples actualizaciones
    if (initialRenderRef.current && items.length > 0) {
      initialRenderRef.current = false;
      console.log("DynamicMarkers: Initial render with items, forcing multiple updates");
      
      // Programar múltiples actualizaciones del mapa y marcadores
      [10, 100, 300, 600, 1000, 2000].forEach(delay => {
        setTimeout(() => {
          console.log(`DynamicMarkers: Forced update at ${delay}ms`);
          map.invalidateSize();
          
          // Forzar actualización de cada marcador
          markerRefs.current.forEach(marker => {
            try {
              if (marker && marker._icon) {
                // Forzar redibujado del icono
                const oldOpacity = marker._icon.style.opacity;
                marker._icon.style.opacity = '0.99';
                setTimeout(() => {
                  if (marker._icon) marker._icon.style.opacity = oldOpacity;
                }, 10);
              }
            } catch (e) {
              console.error("Error updating marker:", e);
            }
          });
        }, delay);
      });
    }
    
    // Actualizar el mapa cada vez que cambian los items
    map.invalidateSize();
    
  }, [items, map]);
  
  // Actualizar marcadores cuando cambia el zoom
  useEffect(() => {
    const handleZoomEnd = () => {
      console.log("DynamicMarkers: Zoom changed, refreshing");
      map.invalidateSize();
      
      // Forzar redibujado de todos los marcadores
      setTimeout(() => {
        markerRefs.current.forEach(marker => {
          if (marker && marker._icon) {
            const oldDisplay = marker._icon.style.display;
            marker._icon.style.display = 'none';
            setTimeout(() => {
              if (marker._icon) marker._icon.style.display = oldDisplay || '';
            }, 5);
          }
        });
      }, 50);
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('dragend', handleZoomEnd);
    
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('dragend', handleZoomEnd);
    };
  }, [map]);
  
  // Auto-abrir popup cuando se selecciona un marker
  useEffect(() => {
    if (selectedId && markerRefs.current.has(selectedId)) {
      const marker = markerRefs.current.get(selectedId);
      marker.openPopup();
    }
  }, [selectedId]);
  
  // Si hay items pero no hay marcadores visibles, intentar actualizar
  useEffect(() => {
    if (items.length > 0 && markerRefs.current.size === 0) {
      console.log("DynamicMarkers: Items exist but no markers are rendered, forcing update");
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [items.length, map]);
  
  // Filtrar por viewport solo en zoom alto para mejor performance
  const visibleItems = useMemo(() => {
    if (!map || map.getZoom() < zoomLevel) return items;
    
    const bounds = map.getBounds();
    return items.filter(item => {
      if (!item || !item.latitud || !item.longitud) return false;
      
      // Ensure coordinates are valid numbers
      const lat = parseFloat(item.latitud);
      const lng = parseFloat(item.longitud);
      
      if (isNaN(lat) || isNaN(lng)) return false;
      
      return bounds.contains([lat, lng]);
    });
  }, [items, map, zoomLevel]);
  
  // Forzar renderizado cuando cambia el número de items visibles
  useEffect(() => {
    console.log(`DynamicMarkers: ${visibleItems.length} visible items of ${items.length} total`);
    if (visibleItems.length > 0) {
      setTimeout(() => map.invalidateSize(), 150);
    }
  }, [visibleItems.length, items.length, map]);
  
  return visibleItems.map(item => {
    if (!item || !item.latitud || !item.longitud) return null;
    
    const lat = parseFloat(item.latitud);
    const lng = parseFloat(item.longitud);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return (
      <Marker
        key={`marker-${item.id || item.cod}`}
        position={[lat, lng]}
        icon={icon}
        eventHandlers={{
          click: () => {
            onMarkerClick(item);
          },
          add: (e) => {
            // Cuando el marcador se añade al mapa, asegurar que es visible
            console.log(`Marker added: ${item.id || item.cod}`);
            setTimeout(() => {
              if (e.target && e.target._icon) {
                e.target._icon.style.opacity = '1';
              }
            }, 50);
          }
        }}
        ref={(ref) => {
          if (ref) {
            markerRefs.current.set(item.id || item.cod, ref);
          } else {
            markerRefs.current.delete(item.id || item.cod);
          }
        }}
      >
        <Popup>{renderPopup(item)}</Popup>
      </Marker>
    );
  }).filter(Boolean); // Filter out any null markers
};