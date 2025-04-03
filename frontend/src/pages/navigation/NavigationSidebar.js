import React from 'react';
import {
  X,
  MapPin,
  PersonStanding,
  Bike,
  Clock,
  ArrowRight,
  Zap,
  Route,
  ArrowLeftRight,
  Download,
  Trash2,
  Plus,
  MoveVertical
} from 'lucide-react';

const NavigationSidebar = ({
  waypoints = [],
  routeInfo,
  routeMode,
  routePreference,
  routeSelectionStep,
  routeAlternatives,
  selectedRouteIndex,
  currentWaypointIndex,
  onRoutePreferenceToggle,
  onRouteModeToggle,
  onWaypointRemove,
  onAddWaypoint,
  onClearRoute,
  onExportRoute,
  onWaypointReorder,
  onRouteAlternativeSelect,
  onClose
}) => {
  // Helper functions
  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
        <h2 className="font-bold text-lg text-[#1f2937]">Route Planner</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-[#6b7280]" />
        </button>
      </div>
      
      {/* Brief instructions */}
      <div className="p-3 bg-blue-50 text-xs text-blue-700 leading-relaxed">
        <p>
          <strong>Create your route:</strong> Click on the map or select from POIs to add waypoints. 
          You can add multiple stops, toggle between walking and cycling modes, and choose shortest or 
          fastest routes.
        </p>
      </div>
      
      {/* Route Selection Progress */}
      <div className="p-4 border-b">
        <div className="flex items-center mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${waypoints && waypoints.length > 0 && waypoints[0] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${waypoints[0] ? 'bg-green-500' : 'bg-gray-200'}`} style={{ width: `${waypoints[0] ? '100%' : '0%'}` }}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${waypoints.length > 1 && waypoints[waypoints.length - 1] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {Math.max(2, waypoints.length)}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-1">
          {routeSelectionStep === 0 && "Select your starting point"}
          {routeSelectionStep === 1 && currentWaypointIndex === 0 && "Select your starting point"}
          {routeSelectionStep === 1 && currentWaypointIndex === 1 && "Select your destination"} 
          {routeSelectionStep === 1 && currentWaypointIndex > 1 && `Select waypoint ${currentWaypointIndex}`}
          {routeSelectionStep === 2 && "Route calculated"}
        </p>
      </div>
      
      {/* Route Options */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-[#1f2937] mb-3">Route Options</h3>
        
        <div className="flex space-x-2 mb-3">
          <button
            onClick={onRouteModeToggle}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
              routeMode === 'walking' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <PersonStanding className="h-4 w-4" />
            <span>Walking</span>
          </button>
          
          <button
            onClick={onRouteModeToggle}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
              routeMode === 'cycling' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Bike className="h-4 w-4" />
            <span>Cycling</span>
          </button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={onRoutePreferenceToggle}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
              routePreference === 'shortest' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Route className="h-4 w-4" />
            <span>Shortest</span>
          </button>
          
          <button
            onClick={onRoutePreferenceToggle}
            className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
              routePreference === 'fastest' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Fastest</span>
          </button>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onAddWaypoint}
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
            disabled={routeSelectionStep < 2}
          >
            <Plus className="h-4 w-4" />
            <span>Add Stop</span>
          </button>
          
          <button
            onClick={onClearRoute}
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200"
            disabled={routeSelectionStep < 2}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
          
          {routeInfo && (
            <button
              onClick={onExportRoute}
              className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Waypoints List */}
      <div className="p-4 border-b">
        <h3 className="font-medium text-[#1f2937] mb-3">Your Route</h3>
        
        <div className="space-y-2">
          {waypoints.map((waypoint, index) => (
            waypoint && (
              <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="h-6 w-6 rounded-full flex items-center justify-center mr-2" 
                     style={{
                       backgroundColor: index === 0 ? '#22c55e' : 
                                        index === waypoints.length - 1 ? '#3b82f6' : 
                                        '#f59e0b',
                       color: 'white',
                       fontWeight: 'bold',
                       fontSize: '12px'
                     }}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {waypoint.custom ? "Custom Location" : waypoint.name_en}
                  </p>
                  <p className="text-xs text-gray-500">
                    {index === 0 ? "Starting Point" : 
                     index === waypoints.length - 1 ? "Destination" : 
                     `Waypoint ${index}`}
                  </p>
                  {waypoint.custom && (
                    <p className="text-xs text-gray-400">
                      {waypoint.coordinates.lat.toFixed(5)}, {waypoint.coordinates.lng.toFixed(5)}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  {/* Reorder buttons */}
                  {waypoints.length > 2 && index > 0 && index < waypoints.length - 1 && (
                    <div className="flex flex-col mr-1">
                      <button
                        onClick={() => onWaypointReorder(index, index - 1)}
                        disabled={index === 1}
                        className={`p-1 ${index === 1 ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Move up"
                      >
                        <MoveVertical className="h-3 w-3 transform rotate-180" />
                      </button>
                      <button
                        onClick={() => onWaypointReorder(index, index + 1)}
                        disabled={index === waypoints.length - 2}
                        className={`p-1 ${index === waypoints.length - 2 ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Move down"
                      >
                        <MoveVertical className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  {waypoints.length > 2 && index !== 0 && index !== waypoints.length - 1 && (
                    <button 
                      onClick={() => onWaypointRemove(index)}
                      className="p-1 rounded-full hover:bg-gray-200"
                      title="Remove waypoint"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            )
          ))}
          
          {/* Show message when no waypoints selected */}
          {(!waypoints.length || waypoints.every(wp => !wp)) && (
            <p className="text-sm text-gray-500 text-center py-2">
              Select points on the map to create a route
            </p>
          )}
        </div>
      </div>
      
      {/* Route Summary */}
      {routeInfo && (
        <div className="p-4 border-b">
          <h3 className="font-medium text-[#1f2937] mb-3">Route Summary</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-gray-500 text-xs mb-1">Total Distance</div>
              <div className="font-semibold text-gray-900">{formatDistance(routeInfo.distance)}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-gray-500 text-xs mb-1">Estimated Time</div>
              <div className="font-semibold text-gray-900">{formatDuration(routeInfo.duration)}</div>
            </div>
          </div>
          
          {/* Leg summaries for multi-stop routes */}
          {routeInfo.legs && routeInfo.legs.length > 1 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Route Segments</h4>
              <div className="space-y-2">
                {routeInfo.legs.map((leg, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-medium">
                        {index === 0 ? 'Start' : `Stop ${index}`} → {index === routeInfo.legs.length - 1 ? 'End' : `Stop ${index + 1}`}
                      </div>
                      <div className="text-gray-500">
                        {formatDistance(leg.distance)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDuration(leg.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Route Alternatives */}
          {routeAlternatives.length > 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Route Alternatives</h4>
              <div className="space-y-2">
                {routeAlternatives.map((route, index) => (
                  <button
                    key={index}
                    className={`w-full py-2 px-3 rounded-md flex items-center justify-between ${
                      selectedRouteIndex === index 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                    }`}
                    onClick={() => onRouteAlternativeSelect(index)}
                  >
                    <div>
                      <span className="text-sm font-medium">Route {index + 1}</span>
                      <p className="text-xs text-gray-500">{formatDistance(route.distance)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {formatDuration(route.duration)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Turn-by-turn Directions */}
      {routeInfo && routeInfo.steps && routeInfo.steps.length > 0 && (
        <div className="p-4">
          <h3 className="font-medium text-[#1f2937] mb-3">Directions</h3>
          <div className="space-y-3">
            {routeInfo.steps.map((step, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-700 mr-2 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: step.maneuver.instruction }} className="text-sm text-gray-800 mb-1" />
                    <div className="text-xs text-gray-500">
                      {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationSidebar;