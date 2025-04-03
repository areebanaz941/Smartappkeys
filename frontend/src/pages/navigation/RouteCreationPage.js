// src/pages/RouteCreationPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox access token here
// IMPORTANT: In a production environment, you should handle this securely
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const RouteCreationPage = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(12.1); // Default longitude for San Lorenzo Nuovo
  const [lat, setLat] = useState(42.7); // Default latitude for San Lorenzo Nuovo
  const [zoom, setZoom] = useState(13);
  const [waypoints, setWaypoints] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [routeType, setRouteType] = useState('walking'); // 'walking' or 'cycling'
  const [difficultyLevel, setDifficultyLevel] = useState('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeDuration, setRouteDuration] = useState(0);
  const [selectedPOIs, setSelectedPOIs] = useState([]);
  const markerRefs = useRef([]);
  
  // Available POIs (in a real app, this would come from your database)
  const [availablePOIs, setAvailablePOIs] = useState([
    { id: 1, name: 'Restaurant Bella Vista', lat: 42.71, lng: 12.11, type: 'restaurant' },
    { id: 2, name: 'Bike Rental Shop', lat: 42.705, lng: 12.105, type: 'bike_rental' },
    { id: 3, name: 'Historic Church', lat: 42.695, lng: 12.095, type: 'attraction' },
    { id: 4, name: 'Local Market', lat: 42.69, lng: 12.12, type: 'shop' }
  ]);

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
      
      // Add click event to add waypoints
      map.current.on('click', (e) => {
        addWaypoint(e.lngLat.lng, e.lngLat.lat);
      });
      
      // Add POI markers
      addPOIMarkers();
    });
    
    // Cleanup function
    return () => map.current.remove();
  }, []);
  
  // Update route when waypoints change
  useEffect(() => {
    if (waypoints.length >= 2) {
      calculateRoute();
    }
  }, [waypoints, routeType]);
  
  // Add POI markers to the map
  const addPOIMarkers = () => {
    availablePOIs.forEach(poi => {
      const el = document.createElement('div');
      el.className = 'poi-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      el.style.backgroundColor = getPoiColor(poi.type);
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <strong>${poi.name}</strong>
          <p>${poi.type}</p>
          <button id="add-to-route-${poi.id}" class="add-poi-btn">Add to Route</button>
        `);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(map.current);
      
      // Add event listener to popup "Add to Route" button
      marker.getElement().addEventListener('click', () => {
        marker.togglePopup();
        
        // Add event listener to the "Add to Route" button
        setTimeout(() => {
          const btn = document.getElementById(`add-to-route-${poi.id}`);
          if (btn) {
            btn.addEventListener('click', () => {
              addPoiToRoute(poi);
              marker.togglePopup();
            });
          }
        }, 0);
      });
    });
  };
  
  // Add POI to the route
  const addPoiToRoute = (poi) => {
    if (!selectedPOIs.some(p => p.id === poi.id)) {
      setSelectedPOIs([...selectedPOIs, poi]);
      
      // Also add as a waypoint if it's not already close to an existing waypoint
      const isCloseToExistingWaypoint = waypoints.some(wp => {
        const distance = calculateDistance(wp[1], wp[0], poi.lat, poi.lng);
        return distance < 0.1; // Within ~100 meters
      });
      
      if (!isCloseToExistingWaypoint) {
        addWaypoint(poi.lng, poi.lat);
      }
    }
  };
  
  // Calculate distance between two points in km using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Get color based on POI type
  const getPoiColor = (type) => {
    switch(type) {
      case 'restaurant': return '#FFD700'; // Gold
      case 'bike_rental': return '#4169E1'; // Royal Blue
      case 'attraction': return '#800080'; // Purple
      case 'shop': return '#FF4500'; // Orange Red
      default: return '#808080'; // Gray
    }
  };
  
  // Add a waypoint to the route
  const addWaypoint = (lng, lat) => {
    // Create a marker
    const marker = new mapboxgl.Marker({ draggable: true, color: '#032c60' })
      .setLngLat([lng, lat])
      .addTo(map.current);
    
    // Add marker to refs array to keep track of it
    const markerIndex = markerRefs.current.length;
    markerRefs.current.push(marker);
    
    // Update waypoints state
    setWaypoints([...waypoints, [lng, lat]]);
    
    // Add drag end event
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const updatedWaypoints = [...waypoints];
      updatedWaypoints[markerIndex] = [lngLat.lng, lngLat.lat];
      setWaypoints(updatedWaypoints);
    });
    
    // Add mouse enter event to show remove button
    marker.getElement().addEventListener('mouseenter', () => {
      marker.getElement().style.cursor = 'move';
      
      // Add a remove button
      const removeBtn = document.createElement('div');
      removeBtn.className = 'remove-waypoint-btn';
      removeBtn.innerHTML = '×';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '-8px';
      removeBtn.style.right = '-8px';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.backgroundColor = 'red';
      removeBtn.style.color = 'white';
      removeBtn.style.fontSize = '16px';
      removeBtn.style.fontWeight = 'bold';
      removeBtn.style.lineHeight = '16px';
      removeBtn.style.textAlign = 'center';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.zIndex = '10';
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeWaypoint(markerIndex);
      });
      
      marker.getElement().appendChild(removeBtn);
    });
    
    // Add mouse leave event to hide remove button
    marker.getElement().addEventListener('mouseleave', () => {
      const removeBtn = marker.getElement().querySelector('.remove-waypoint-btn');
      if (removeBtn) {
        marker.getElement().removeChild(removeBtn);
      }
    });
  };
  
  // Remove a waypoint from the route
  const removeWaypoint = (index) => {
    // Remove marker from map
    markerRefs.current[index].remove();
    
    // Remove marker from refs array
    markerRefs.current.splice(index, 1);
    
    // Update waypoints state
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
    
    // Update other markers' indices
    markerRefs.current.forEach((marker, i) => {
      marker.getElement().onmouseenter = () => {
        marker.getElement().style.cursor = 'move';
        
        const removeBtn = document.createElement('div');
        removeBtn.className = 'remove-waypoint-btn';
        removeBtn.innerHTML = '×';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '-8px';
        removeBtn.style.right = '-8px';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.borderRadius = '50%';
        removeBtn.style.backgroundColor = 'red';
        removeBtn.style.color = 'white';
        removeBtn.style.fontSize = '16px';
        removeBtn.style.fontWeight = 'bold';
        removeBtn.style.lineHeight = '16px';
        removeBtn.style.textAlign = 'center';
        removeBtn.style.cursor = 'pointer';
        
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeWaypoint(i);
        });
        
        marker.getElement().appendChild(removeBtn);
      };
    });
  };
  
  // Calculate route using Mapbox Directions API
  const calculateRoute = async () => {
    if (waypoints.length < 2) return;
    
    setIsLoading(true);
    
    try {
      // Create coordinates string for API request
      const coordinates = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
      
      // Build the Mapbox Directions API URL
      const url = `https://api.mapbox.com/directions/v5/mapbox/${routeType === 'walking' ? 'walking' : 'cycling'}/${coordinates}?alternatives=false&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}&overview=full&annotations=duration,distance,speed`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData(route);
        
        // Calculate total distance and duration
        setRouteDistance(route.distance);
        setRouteDuration(route.duration);
        
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
              'line-color': routeType === 'walking' ? '#4169E1' : '#32CD32',
              'line-width': 6,
              'line-opacity': 0.8
            }
          });
        }
        
        // Fit map to the route
        const bounds = new mapboxgl.LngLatBounds();
        waypoints.forEach(wp => bounds.extend([wp[0], wp[1]]));
        
        map.current.fitBounds(bounds, {
          padding: 50
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
    
    setIsLoading(false);
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
  
  // Reset the route
  const resetRoute = () => {
    // Remove all markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];
    
    // Reset waypoints
    setWaypoints([]);
    
    // Reset selected POIs
    setSelectedPOIs([]);
    
    // Remove route from map
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    
    // Reset form
    setRouteName('');
    setRouteDescription('');
    setRouteType('walking');
    setDifficultyLevel('easy');
    setRouteData(null);
    setRouteDistance(0);
    setRouteDuration(0);
  };
  
  // Save the route
  const saveRoute = async () => {
    if (!routeName || waypoints.length < 2 || !routeData) {
      alert('Please provide a route name and at least 2 waypoints');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would save the route data to your backend
      // Here is a mockup of the data you would send:
      const routeToSave = {
        name: routeName,
        description: routeDescription,
        type: routeType,
        difficultyLevel: difficultyLevel,
        waypoints: waypoints,
        geometry: routeData.geometry,
        distance: routeDistance,
        duration: routeDuration,
        pois: selectedPOIs.map(poi => poi.id)
      };
      
      console.log('Route to save:', routeToSave);
      
      // Mock successful save
      setTimeout(() => {
        alert('Route saved successfully!');
        resetRoute();
        setIsLoading(false);
      }, 1000);
      
      // In reality, you would do something like:
      // const response = await fetch('/api/routes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(routeToSave)
      // });
      // const data = await response.json();
      // handle success/error
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error saving route');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create New Route</h1>
          <Link 
            to="/admin"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div 
                ref={mapContainer} 
                className="w-full h-96 rounded-lg mb-4 relative"
              />
              
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Mode Selection</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setRouteType('walking')} 
                      className={`px-4 py-2 rounded-md ${routeType === 'walking' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                    >
                      Walking
                    </button>
                    <button 
                      onClick={() => setRouteType('cycling')} 
                      className={`px-4 py-2 rounded-md ${routeType === 'cycling' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                    >
                      Cycling
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
              
              {/* Waypoints List */}
              <div className="mt-4">
                <h3 className="font-medium mb-2">Waypoints ({waypoints.length})</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  {waypoints.length === 0 ? (
                    <p className="text-gray-500">Click on the map to add waypoints</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {waypoints.map((waypoint, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded-md">
                          <span>Waypoint {index + 1}</span>
                          <span className="text-sm text-gray-500">
                            {waypoint[1].toFixed(5)}, {waypoint[0].toFixed(5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Route Statistics */}
              {routeData && (
                <div className="mt-4 bg-gray-100 p-3 rounded-lg">
                  <h3 className="font-medium mb-2">Route Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-2 rounded-md">
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-bold">{formatDistance(routeDistance)}</p>
                    </div>
                    <div className="bg-white p-2 rounded-md">
                      <p className="text-sm text-gray-500">Estimated Time</p>
                      <p className="font-bold">{formatDuration(routeDuration)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Route Details Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Route Name*
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter route name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter route description"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="difficult">Difficult</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                
                {/* Selected POIs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points of Interest ({selectedPOIs.length})
                  </label>
                  <div className="bg-gray-100 p-2 rounded-md">
                    {selectedPOIs.length === 0 ? (
                      <p className="text-gray-500 text-sm">No POIs selected. Click on POI markers to add them to the route.</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedPOIs.map((poi) => (
                          <div key={poi.id} className="flex justify-between items-center bg-white p-2 rounded-md">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: getPoiColor(poi.type) }}
                              ></div>
                              <span>{poi.name}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedPOIs(selectedPOIs.filter(p => p.id !== poi.id));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                  <button
                    onClick={saveRoute}
                    disabled={isLoading || waypoints.length < 2 || !routeName}
                    className={`w-full py-2 px-4 rounded-md ${
                      isLoading || waypoints.length < 2 || !routeName
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-yellowgreen text-white hover:bg-[#6aaf1a]'
                    } transition-colors`}
                  >
                    {isLoading ? 'Saving...' : 'Save Route'}
                  </button>
                </div>

                {/* GPX File Upload */}
<div className="mt-4">
  <h3 className="font-medium mb-2">Or Upload GPX File</h3>
  <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
    <input
      type="file"
      accept=".gpx"
      className="hidden"
      id="gpx-file-input"
      onChange={(e) => {
        // Handle GPX file upload
        // In a real implementation, you would parse the GPX file
        // and extract waypoints to create the route
        console.log('GPX file selected:', e.target.files[0]);
        alert('GPX file upload functionality would be implemented here');
      }}
    />
    <label
      htmlFor="gpx-file-input"
      className="cursor-pointer px-4 py-2 bg-[#032c60] text-white rounded-md inline-block"
    >
      Choose GPX File
    </label>
    <p className="text-sm text-gray-500 mt-2">
      Upload a GPX file to automatically create a route
    </p>
  </div>
</div>

{/* API Key Settings Section */}
<div className="mt-4">
  <h3 className="font-medium mb-2">API Settings</h3>
  <div className="bg-gray-100 p-3 rounded-md">
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Mapbox Access Token
      </label>
      <div className="flex">
      <input
  type="password"
  className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
  placeholder="Token loaded from environment variables"
  value={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? "••••••••••••••••••••" : ""}
  disabled
  readOnly
/>
        <button className="bg-gray-200 text-gray-700 px-2 rounded-r-md">
          Update
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Required for the Mapbox Directions API
      </p>
    </div>
    
    <div>
      <div className="flex items-center mb-1">
        <input
          type="checkbox"
          id="cache-api-results"
          className="mr-2"
          checked={true}
          onChange={() => {/* Handle checkbox change */}}
        />
        <label htmlFor="cache-api-results" className="text-sm font-medium text-gray-700">
          Cache API Results
        </label>
      </div>
      <p className="text-xs text-gray-500">
        Enable caching to reduce API calls and improve performance
      </p>
    </div>
  </div>
</div>

{/* Remove the extra closing curly brace that was here */}
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-4">
              <h3 className="font-medium mb-2">Tips for Route Creation</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Click on the map to add waypoints</li>
                <li>Drag waypoints to adjust the route</li>
                <li>Hover over a waypoint and click the X to remove it</li>
                <li>Click on POI markers to add them to your route</li>
                <li>For the best experience, add at least 2-3 waypoints</li>
                <li>Save the route when you're satisfied with it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCreationPage;