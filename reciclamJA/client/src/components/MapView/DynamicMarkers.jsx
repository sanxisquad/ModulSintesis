import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';

export const DynamicMarkers = ({ 
  items, 
  icon, 
  selectedId, 
  onMarkerClick, 
  renderPopup 
}) => {
  const map = useMap();
  const [bounds, setBounds] = useState(null);
  const lastBounds = useRef(null);
  const markerRefs = useRef(new Map());

  useEffect(() => {
    if (!map) return;

    const updateBounds = () => {
      const newBounds = map.getBounds();
      
      if (!lastBounds.current || !lastBounds.current.equals(newBounds)) {
        lastBounds.current = newBounds;
        setBounds(newBounds);
      }
    };

    updateBounds();
    map.on('moveend', updateBounds);
    
    return () => {
      map.off('moveend', updateBounds);
    };
  }, [map]);

  const visibleItems = useMemo(() => {
    if (!bounds) return [];
    return items.filter(item => bounds.contains([item.latitud, item.longitud]));
  }, [items, bounds]);

  return visibleItems.map(item => (
    <Marker
      key={`marker-${item.id}`}
      position={[item.latitud, item.longitud]}
      icon={icon}
      eventHandlers={{
        click: () => {
          onMarkerClick(item);
          const marker = markerRefs.current.get(item.id);
          if (marker) {
            marker.openPopup();
          }
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