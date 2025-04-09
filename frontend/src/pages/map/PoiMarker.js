import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getPoiMarkerColor, colorizePointerImage } from './poiCategoryColors';

const PoiMarker = ({ 
  poi, 
  map, 
  onMarkerClick, 
  onMarkerHover, 
  onMarkerLeave 
}) => {
  const [markerElement, setMarkerElement] = useState(null);
  const [colorizedImage, setColorizedImage] = useState(null);

  // Get coordinates in Mapbox format
  const getMapboxCoords = () => {
    if (!poi || (!poi.coordinates && typeof poi.coordinates !== 'string')) return null;
    
    let coords;
    if (typeof poi.coordinates === 'string') {
      const coordsArray = poi.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coordsArray.length === 2 && !isNaN(coordsArray[0]) && !isNaN(coordsArray[1])) {
        coords = [coordsArray[1], coordsArray[0]]; // [lng, lat] for Mapbox
      } else {
        console.warn('Invalid string coordinates format', poi.coordinates);
        return null;
      }
    } else if (poi.coordinates?.lat && poi.coordinates?.lng) {
      if (isNaN(poi.coordinates.lat) || isNaN(poi.coordinates.lng)) {
        console.warn('Invalid object coordinates values', poi.coordinates);
        return null;
      }
      coords = [poi.coordinates.lng, poi.coordinates.lat];
    } else {
      return null;
    }
    
    return coords;
  };

  // Colorize marker when component mounts
  useEffect(() => {
    const colorizeMarker = async () => {
      const category = poi.category?.toLowerCase() || 'default';
      const markerColor = getPoiMarkerColor(category);
      
      try {
        const coloredImage = await colorizePointerImage('/pointer.png', markerColor);
        setColorizedImage(coloredImage);
      } catch (error) {
        console.error('Error colorizing marker:', error);
      }
    };

    colorizeMarker();
  }, [poi.category]);

  // Create and add marker to map
  useEffect(() => {
    if (!map || !colorizedImage) return;

    const coords = getMapboxCoords();
    if (!coords) {
      console.warn(`Invalid coordinates for POI: ${poi.name_en}`);
      return;
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'poi-marker marker';
    el.style.backgroundImage = `url(${colorizedImage})`;
    el.style.width = '66px';
    el.style.height = '66px';
    el.style.backgroundSize = 'contain';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.cursor = 'pointer';

    // Category class for filtering
    const category = poi.category?.toLowerCase() || 'default';
    el.classList.add(`category-${category}`);

    // Create popup
    const popup = new mapboxgl.Popup({ 
      offset: 25,
      closeButton: false
    })
    .setHTML(`
      <div class="popup-content">
        <h3 class="font-bold">${poi.name_en}</h3>
        <p>${poi.type_en}</p>
      </div>
    `);

    // Create marker
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
      pitchAlignment: 'map',
      rotationAlignment: 'map'
    })
    .setLngLat(coords)
    .setPopup(popup)
    .addTo(map);

    // Store the marker element
    setMarkerElement(el);

    // Hover handling
    const handleMouseEnter = () => {
      if (onMarkerHover) {
        onMarkerHover(poi);
      }
    };

    const handleMouseLeave = () => {
      if (onMarkerLeave) {
        onMarkerLeave();
      }
    };

    const handleClick = (e) => {
      // Prevent popup from interfering with click handling
      e.stopPropagation();

      if (onMarkerClick) {
        onMarkerClick(poi);
      }

      // Show popup briefly
      marker.togglePopup();
      setTimeout(() => {
        marker.getPopup().remove();
      }, 1500);
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('click', handleClick);
      marker.remove();
    };
  }, [map, colorizedImage, poi]);

  // No visible rendering, this is a map marker component
  return null;
};

export default PoiMarker;