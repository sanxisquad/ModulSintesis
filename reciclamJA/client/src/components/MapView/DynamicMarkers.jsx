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

  // Auto-abrir popup cuando se selecciona un marker
  useEffect(() => {
    if (selectedId && markerRefs.current.has(selectedId)) {
      const marker = markerRefs.current.get(selectedId);
      marker.openPopup();
    }
  }, [selectedId]);

  // Opcional: Filtrar por viewport solo en zoom alto para mejor performance
  const visibleItems = useMemo(() => {
    if (!map || map.getZoom() < zoomLevel) return items;
    
    const bounds = map.getBounds();
    return items.filter(item => {
      return bounds.contains([item.latitud, item.longitud]);
    });
  }, [items, map, zoomLevel]);

  return visibleItems.map(item => (
    <Marker
      key={`marker-${item.id}`}
      position={[item.latitud, item.longitud]}
      icon={icon}
      eventHandlers={{
        click: () => {
          onMarkerClick(item);
        }
      }}
      ref={(ref) => {
        if (ref) {
          markerRefs.current.set(item.id, ref);
        } else {
          markerRefs.current.delete(item.id);
        }
      }}
    >
      <Popup>
        {renderPopup(item)}
      </Popup>
    </Marker>
  ));
};