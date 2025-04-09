import React from 'react';
import { MapPin } from 'lucide-react';
import { getPoiMarkerColor } from './PoiMarker';

const PoiListItem = ({ 
  poi, 
  map, 
  onSelectPoi, 
  onStartRouteFromPoi 
}) => {
  // Get category color
  const category = poi.category?.toLowerCase() || 'default';
  const markerColor = getPoiMarkerColor(category);

  // Helper to get coordinates for map centering
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

  // Handle POI selection and map centering
  const handleSelectPoi = () => {
    if (onSelectPoi) {
      onSelectPoi(poi);
    }

    // Center map on POI
    const coords = getMapboxCoords();
    if (coords && map) {
      map.flyTo({
        center: coords,
        zoom: 15,
        essential: true
      });
    }
  };

  return (
    <div 
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
      onClick={handleSelectPoi}
    >
      <div className="flex items-start">
        <div 
          className="h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center mr-2"
          style={{ 
            backgroundColor: `${markerColor}20`, // 20% opacity background
            color: markerColor 
          }}
        >
          <MapPin className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[#1f2937] group-hover:text-[#22c55e]">
            {poi.name_en}
          </h3>
          <div className="flex items-center text-sm text-[#6b7280] mt-1">
            <span className="capitalize">
              {poi.category ? poi.category.replace('_', ' ') : poi.type_en}
            </span>
          </div>
          {poi.description_en && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {poi.description_en}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          <button 
            className="text-xs py-1 px-2 rounded bg-green-100 text-green-700 hover:bg-green-200"
            onClick={(e) => {
              e.stopPropagation();
              if (onStartRouteFromPoi) {
                onStartRouteFromPoi(poi);
              }
            }}
          >
            Start Route
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoiListItem;