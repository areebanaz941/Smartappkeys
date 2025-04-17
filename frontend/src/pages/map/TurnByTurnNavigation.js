import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Custom turn-by-turn navigation component with i18n support
const TurnByTurnNavigation = ({ steps, map }) => {
    const { t } = useTranslation();
    const [hoveredStepIndex, setHoveredStepIndex] = useState(null);
  
    // Map of Mapbox maneuver types to custom arrow components
    const getManeuverIcon = (type) => {
      switch (type) {
        case 'turn-right':
          return <ArrowTurnRight />;
        case 'turn-left':
          return <ArrowTurnLeft />;
        case 'sharp right':
          return <ArrowSharpRight />;
        case 'sharp left':
          return <ArrowSharpLeft />;
        case 'slight right':
          return <ArrowSlightRight />;
        case 'slight left':
          return <ArrowSlightLeft />;
        case 'straight':
          return <ArrowStraight />;
        case 'uturn':
          return <ArrowUTurn />;
        default:
          return <ArrowDefault />;
      }
    };
  
    // Highlight route segment when hovering
    const handleStepHover = (index) => {
      if (!map) return;
  
      setHoveredStepIndex(index);
  
      // Ensure the route layer exists
      if (map.getLayer('route')) {
        // Get the full route geometry
        const routeSource = map.getSource('route');
        
        if (routeSource) {
          const routeData = routeSource._data;
          
          // Slice the route geometry to highlight the specific step
          const startIndex = steps.slice(0, index).reduce((acc, step) => 
            acc + step.geometry.coordinates.length, 0);
          const endIndex = startIndex + steps[index].geometry.coordinates.length;
  
          // Create a new GeoJSON feature with just the hovered step
          const highlightedStepGeoJSON = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeData.geometry.coordinates.slice(startIndex, endIndex)
            }
          };
  
          // Add or update a highlight layer
          if (!map.getLayer('route-highlight')) {
            map.addLayer({
              id: 'route-highlight',
              type: 'line',
              source: {
                type: 'geojson',
                data: highlightedStepGeoJSON
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#ff0000', // Bright red highlight
                'line-width': 6,
                'line-opacity': 0.7
              }
            });
          } else {
            map.getSource('route-highlight').setData(highlightedStepGeoJSON);
          }
        }
      }
    };
  
    // Remove highlight when not hovering
    const handleStepLeave = () => {
      if (!map) return;
  
      setHoveredStepIndex(null);
  
      // Remove the highlight layer if it exists
      if (map.getLayer('route-highlight')) {
        map.removeLayer('route-highlight');
        map.removeSource('route-highlight');
      }
    };
  
    return (
      <div className="turn-by-turn-navigation bg-white rounded-lg shadow-md">
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            {t('map.navigation.title', 'Turn-by-Turn Directions')}
          </h3>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                  hoveredStepIndex === index 
                    ? 'bg-red-50 border border-red-100' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onMouseEnter={() => handleStepHover(index)}
                onMouseLeave={handleStepLeave}
              >
                <div className="mr-4 flex-shrink-0">
                  {getManeuverIcon(step.maneuver.type)}
                </div>
                <div className="flex-1">
                  <div 
                    className="text-sm text-gray-800 mb-1"
                    dangerouslySetInnerHTML={{ __html: step.maneuver.instruction }}
                  />
                  <div className="text-xs text-gray-500">
                    {formatDistance(step.distance)} · {formatDuration(step.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

// Directional Arrow Components remain the same
const ArrowDefault = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 16 16 12 12 8" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

// Other arrow components...
const ArrowStraight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const ArrowTurnRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="13 17 18 12 13 7" />
    <path d="M6 12h7a4 4 0 0 1 4 4v3" />
  </svg>
);

const ArrowTurnLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="11 17 6 12 11 7" />
    <path d="M18 12H11a4 4 0 0 0-4 4v3" />
  </svg>
);

const ArrowSlightRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 10 14 4 8" />
    <path d="M20 6v10a2 2 0 0 1-2 2H4" />
  </svg>
);

const ArrowSlightLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6 14 14 20 8" />
    <path d="M4 6v10a2 2 0 0 0 2 2h14" />
  </svg>
);

const ArrowSharpRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 15V9h6" />
    <path d="M20 9c-3.5 5-7 7-10 7l4 4" />
  </svg>
);

const ArrowSharpLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15V9H4" />
    <path d="M4 9c3.5 5 7 7 10 7l-4 4" />
  </svg>
);

const ArrowUTurn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 17l-5-5 5-5" />
    <path d="M14 17l5-5-5-5" />
    <path d="M10 12h7a2 2 0 0 0 2-2V6" />
  </svg>
);

// Utility functions for formatting (assuming these are defined globally)
const formatDistance = (meters) => {
  if (!meters && meters !== 0) return 'N/A';
  return (meters / 1000).toFixed(1) + ' km';
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  } else {
    return `${minutes} min`;
  }
};

export default TurnByTurnNavigation;