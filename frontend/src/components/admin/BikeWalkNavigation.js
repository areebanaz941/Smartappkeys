// src/components/admin/BikeWalkNavigation.jsx
import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token here
// IMPORTANT: In a production environment, you should handle this securely
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const BikeWalkNavigation = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(12.1); // Default longitude for San Lorenzo Nuovo
  const [lat, setLat] = useState(42.7); // Default latitude for San Lorenzo Nuovo
  const [zoom, setZoom] = useState(13);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeMode, setRouteMode] = useState('walking'); // 'walking' or 'cycling'
  const [routeProfile, setRouteProfile] = useState('mapbox/walking'); // mapbox/walking or mapbox/cycling
  const [routeData, setRouteData] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [optimization, setOptimization] = useState('shortest'); // 'shortest' or 'fastest'
  const [pois, setPois] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [elevationProfile, setElevationProfile] = useState(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.current.addControl(geolocate, 'top-right');

    // When map loads, get user location
    map.current.on('load', () => {
      geolocate.trigger();
      
      // Add click event to set start and end points
      map.current.on('click', (e) => {
        if (!startPoint) {
          setStartPoint([e.lngLat.lng, e.lngLat.lat]);
          
          // Add marker for start point
          new mapboxgl.Marker({ color: '#32CD32' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);
          
        } else if (!endPoint) {
          setEndPoint([e.lngLat.lng, e.lngLat.lat]);
          
          // Add marker for end point
          new mapboxgl.Marker({ color: '#DC143C' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);
          
          // Get route when both points are set
          getRoute();
        }
      });
      
      // Fetch sample POIs (you would replace this with actual API call)
      fetchPOIs();
    });
    
    // Cleanup function
    return () => map.current.remove();
  }, []);
  
  // Update route when mode or optimization changes
  useEffect(() => {
    if (startPoint && endPoint) {
      getRoute();
    }
  }, [routeProfile, optimization]);
  
  // Fetch POIs (this would be replaced with your actual API call)
  const fetchPOIs = async () => {
    // Placeholder for API call to get POIs
    // For now, we'll use dummy data
    const dummyPOIs = [
      { id: 1, name: 'Restaurant Bella Vista', lat: 42.71, lng: 12.11, type: 'restaurant' },
      { id: 2, name: 'Bike Rental Shop', lat: 42.705, lng: 12.105, type: 'bike_rental' },
      { id: 3, name: 'Historic Church', lat: 42.695, lng: 12.095, type: 'attraction' },
      { id: 4, name: 'Local Market', lat: 42.69, lng: 12.12, type: 'shop' }
    ];
    
    setPois(dummyPOIs);
    
    // Add POI markers to map
    dummyPOIs.forEach(poi => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setText(poi.name);
      
      new mapboxgl.Marker({ color: getMarkerColor(poi.type) })
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  };
  
  // Get marker color based on POI type
  const getMarkerColor = (type) => {
    switch(type) {
      case 'restaurant': return '#FFD700'; // Gold
      case 'bike_rental': return '#4169E1'; // Royal Blue
      case 'attraction': return '#800080'; // Purple
      case 'shop': return '#FF4500'; // Orange Red
      default: return '#808080'; // Gray
    }
  };
  
  // Get route using Mapbox Directions API
  const getRoute = async () => {
    if (!startPoint || !endPoint) return;

    try {
      // Build the Mapbox Directions API URL
      const url = `https://api.mapbox.com/directions/v5/${routeProfile}/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?alternatives=false&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}&overview=full&annotations=duration,distance,speed`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route);
        
        // Extract turn-by-turn instructions
        const steps = route.legs[0].steps;
        setInstructions(steps.map(step => ({
          text: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration
        })));
        
        // Calculate total distance and duration
        setDistance(route.distance);
        setDuration(route.duration);
        
        // Draw the route on the map
        if (map.current.getSource('route')) {
          map.current.getSource('route').setData({
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          });
        } else {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });
          
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': routeMode === 'walking' ? '#4169E1' : '#32CD32',
              'line-width': 6,
              'line-opacity': 0.8
            }
          });
        }
        
        // Fit map to the route
        const bounds = new mapboxgl.LngLatBounds()
          .extend(startPoint)
          .extend(endPoint);
        
        map.current.fitBounds(bounds, {
          padding: 50
        });
        
        // Generate elevation profile (this would be replaced with actual API call)
        generateMockElevationProfile();
        
        // Show route preview
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };
  
  // Generate mock elevation profile (in a real app, you'd get this from an API)
  const generateMockElevationProfile = () => {
    if (!routeData) return;
    
    // Create mock elevation data
    const steps = 20;
    const mockElevation = Array.from({ length: steps }, (_, i) => {
      return {
        distance: (routeData.distance / steps) * i,
        elevation: 300 + Math.sin(i / (steps / Math.PI) * 2) * 50 + Math.random() * 20
      };
    });
    
    setElevationProfile(mockElevation);
  };
  
  // Start navigation
  const startNavigation = () => {
    setIsNavigating(true);
    setShowPreview(false);
    setCurrentInstruction(0);
    
    // In a real app, you would start tracking the user's position here
    // and update their position along the route
  };
  
  // Pause/resume navigation
  const toggleNavigation = () => {
    setIsNavigating(!isNavigating);
  };
  
  // Reset the route
  const resetRoute = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRouteData(null);
    setInstructions([]);
    setIsNavigating(false);
    setShowPreview(false);
    
    // Remove route from map
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    
    // Remove markers (in a real app, you would keep track of the markers and remove them)
    // For now, we'll just reload the map
    map.current.remove();
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');
    
    map.current.on('load', () => {
      geolocate.trigger();
      map.current.on('click', (e) => {
        if (!startPoint) {
          setStartPoint([e.lngLat.lng, e.lngLat.lat]);
          new mapboxgl.Marker({ color: '#32CD32' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);
        } else if (!endPoint) {
          setEndPoint([e.lngLat.lng, e.lngLat.lat]);
          new mapboxgl.Marker({ color: '#DC143C' })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map.current);
          getRoute();
        }
      });
      
      fetchPOIs();
    });
  };
  
  // Handle mode change (walking/cycling)
  const handleModeChange = (mode) => {
    setRouteMode(mode);
    setRouteProfile(mode === 'walking' ? 'mapbox/walking' : 'mapbox/cycling');
  };
  
  // Format distance for display
  const formatDistance = (meters) => {
    return meters < 1000 
      ? `${Math.round(meters)} m` 
      : `${(meters / 1000).toFixed(2)} km`;
  };
  
  // Format duration for display
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
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Bike & Walk Navigation Management</h2>
      
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg mb-4 relative"
      />
      
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-gray-100 p-3 rounded-lg">
          <h3 className="font-medium mb-2">Mode Selection</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => handleModeChange('walking')} 
              className={`px-4 py-2 rounded-md ${routeMode === 'walking' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Walking
            </button>
            <button 
              onClick={() => handleModeChange('cycling')} 
              className={`px-4 py-2 rounded-md ${routeMode === 'cycling' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Cycling
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-lg">
          <h3 className="font-medium mb-2">Optimization</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setOptimization('shortest')} 
              className={`px-4 py-2 rounded-md ${optimization === 'shortest' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Shortest
            </button>
            <button 
              onClick={() => setOptimization('fastest')} 
              className={`px-4 py-2 rounded-md ${optimization === 'fastest' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Fastest
            </button>
          </div>
        </div>
        
        <div className="bg-gray-100 p-3 rounded-lg flex items-end">
          <button 
            onClick={resetRoute} 
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            Reset Route
          </button>
        </div>
      </div>
      
      {/* Route Preview */}
      {showPreview && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Route Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Distance:</strong> {formatDistance(distance)}</p>
              <p><strong>Estimated Time:</strong> {formatDuration(duration)}</p>
              <p><strong>Mode:</strong> {routeMode === 'walking' ? 'Walking' : 'Cycling'}</p>
              
              <button 
                onClick={startNavigation} 
                className="mt-3 px-4 py-2 bg-yellowgreen text-white rounded-md"
              >
                Start Navigation
              </button>
            </div>
            
            {/* Elevation Profile */}
            {elevationProfile && (
              <div className="h-40 border border-gray-300 rounded-md p-2 bg-white">
                <h4 className="text-sm text-gray-500 mb-1">Elevation Profile</h4>
                <div className="h-32 flex items-end">
                  {elevationProfile.map((point, index) => (
                    <div 
                      key={index}
                      className="flex-1 bg-[#032c60] mx-px"
                      style={{ 
                        height: `${((point.elevation - 250) / 100) * 100}%`,
                        opacity: 0.7 + (index / elevationProfile.length) * 0.3
                      }}
                      title={`${Math.round(point.elevation)}m`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation Panel */}
      {isNavigating && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Turn-by-Turn Navigation</h3>
            <button 
              onClick={toggleNavigation}
              className={`px-4 py-2 rounded-md ${isNavigating ? 'bg-yellow-500' : 'bg-yellowgreen'} text-white`}
            >
              {isNavigating ? 'Pause' : 'Resume'}
            </button>
          </div>
          
          {/* Current Instruction */}
          <div className="bg-white p-3 rounded-md mb-3 border-l-4 border-[#032c60]">
            <p className="font-medium">{instructions[currentInstruction]?.text}</p>
            <p className="text-sm text-gray-500">
              {formatDistance(instructions[currentInstruction]?.distance)} • 
              {formatDuration(instructions[currentInstruction]?.duration)}
            </p>
          </div>
          
          {/* Upcoming Instructions */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {instructions.slice(currentInstruction + 1, currentInstruction + 4).map((instruction, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md">
                <p className="text-sm">{instruction.text}</p>
                <p className="text-xs text-gray-500">
                  {formatDistance(instruction.distance)} • 
                  {formatDuration(instruction.duration)}
                </p>
              </div>
            ))}
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-between mt-4">
            <button 
              onClick={() => setCurrentInstruction(Math.max(0, currentInstruction - 1))}
              className="px-4 py-2 bg-gray-200 rounded-md"
              disabled={currentInstruction === 0}
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentInstruction(Math.min(instructions.length - 1, currentInstruction + 1))}
              className="px-4 py-2 bg-gray-200 rounded-md"
              disabled={currentInstruction === instructions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* POIs Near Route */}
      {routeData && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">POIs Near Route</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {pois.map(poi => (
              <div key={poi.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium">{poi.name}</h4>
                <p className="text-sm text-gray-500">{poi.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BikeWalkNavigation;