import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Layers, 
  Info, 
  X, 
  List, 
  Bike, 
  Download,
  Trash2,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';

import config from '../../config';

// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibTJvdGVjaCIsImEiOiJjbTczbzU4aWQwMWdmMmpzY3N4ejJ3czlnIn0.fLDR4uG8kD8-g_IDM8ZPdQ';

const GpxTrackMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [visibleRoutes, setVisibleRoutes] = useState(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isGpxLoading, setIsGpxLoading] = useState(false);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState('all');
  
  // Refs for cleanup
  const sourceIds = useRef(new Set());
  const layerIds = useRef(new Set());
  const markersRef = useRef([]);
  
  // Color map for route display
  const routeColors = {
    'easy': '#22c55e',      // Green
    'medium': '#f59e0b',    // Amber
    'hard': '#ef4444',      // Red
    'default': '#3b82f6'    // Blue
  };

  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(config.getApiUrl('bike-routes'));
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch bike routes');
        }
        
        setRoutes(data.data || []);
        setFilteredRoutes(data.data || []);
        console.log('Bike routes loaded:', data.data?.length || 0);
      } catch (err) {
        console.error('Error fetching bike routes:', err);
        setError(`Failed to load bike routes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Default center (San Lorenzo Nuovo)
    const defaultCenter = [11.907, 42.685]; // [lng, lat] for Mapbox GL
    
    try {
      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v11', // Outdoors style good for biking
        center: defaultCenter,
        zoom: 10
      });
      
      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      
      // Add geolocate control
      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }),
        'bottom-right'
      );
      
      // Set map when loaded
      mapInstance.on('load', () => {
        setMap(mapInstance);
      });
      
      return () => {
        // Clean up map on unmount
        if (mapInstance) {
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          
          layerIds.current.forEach(id => {
            if (mapInstance.getLayer(id)) {
              mapInstance.removeLayer(id);
            }
          });
          
          sourceIds.current.forEach(id => {
            if (mapInstance.getSource(id)) {
              mapInstance.removeSource(id);
            }
          });
          
          mapInstance.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Failed to initialize map: ${error.message}`);
    }
  }, []);

  // Update filtered routes when search or filters change
  useEffect(() => {
    if (!routes.length) return;
    
    let filtered = [...routes];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(route => 
        route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.roadType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(route => route.difficulty === difficultyFilter);
    }
    
    // Apply road type filter
    if (roadTypeFilter !== 'all') {
      filtered = filtered.filter(route => route.roadType === roadTypeFilter);
    }
    
    setFilteredRoutes(filtered);
  }, [searchQuery, difficultyFilter, roadTypeFilter, routes]);

  // Function to fetch and display a GPX track
  const fetchAndDisplayGpx = async (routeId) => {
    if (!map || !routeId) return;
    
    try {
      setIsGpxLoading(true);
      
      // Fetch route details first
      const routeResponse = await fetch(config.getApiUrl(`bike-routes/${routeId}`));
      
      if (!routeResponse.ok) {
        throw new Error(`Failed to fetch route details: ${routeResponse.status}`);
      }
      
      const routeData = await routeResponse.json();
      
      if (!routeData.success) {
        throw new Error(routeData.message || 'Failed to fetch route details');
      }
      
      const route = routeData.data;
      
      // Check if this route is already loaded (path data exists)
      if (route.path && route.path.length > 0) {
        displayRouteFromPath(route);
      } else {
        // Fetch the route path data
        const pathResponse = await fetch(config.getApiUrl(`bike-routes/${routeId}/path`));
        
        if (!pathResponse.ok) {
          throw new Error(`Failed to fetch route path: ${pathResponse.status}`);
        }
        
        const pathData = await pathResponse.json();
        
        if (!pathData.success) {
          throw new Error(pathData.message || 'Failed to fetch route path');
        }
        
        // Display the route with the retrieved path data
        displayRouteFromGeoJson(route, pathData.data);
      }
      
      // Add route to visible routes set
      setVisibleRoutes(prev => new Set(prev).add(routeId));
      
      // Update selected route
      setSelectedRoute(route);
      
    } catch (err) {
      console.error('Error fetching GPX data:', err);
      setError(`Failed to load route: ${err.message}`);
    } finally {
      setIsGpxLoading(false);
    }
  };

  // Display route directly from path data
  const displayRouteFromPath = (route) => {
    if (!map || !route.path || route.path.length === 0) return;
    
    // Create a GeoJSON object from the path
    const geojson = {
      type: 'Feature',
      properties: {
        name: route.name,
        difficulty: route.difficulty,
        roadType: route.roadType,
        id: route._id
      },
      geometry: {
        type: 'LineString',
        coordinates: route.path
      }
    };
    
    // Add to map
    addRouteToMap(route._id, geojson, route.difficulty);
    
    // Add start and end markers
    addRouteMarkers(route);
    
    // Fit to route bounds if it's the only visible route
    if (visibleRoutes.size === 0) {
      fitMapToRoute(route.path);
    }
  };

  // Display route from GeoJSON data
  const displayRouteFromGeoJson = (route, geoJson) => {
    if (!map || !geoJson || !geoJson.geometry || !geoJson.geometry.coordinates) return;
    
    // Add to map
    addRouteToMap(route._id, geoJson, route.difficulty);
    
    // Add start and end markers
    addRouteMarkers(route, geoJson.geometry.coordinates);
    
    // Fit to route bounds if it's the only visible route
    if (visibleRoutes.size === 0) {
      fitMapToRoute(geoJson.geometry.coordinates);
    }
  };

  // Add route to map
  const addRouteToMap = (routeId, geoJson, difficulty = 'default') => {
    const sourceId = `route-source-${routeId}`;
    const layerId = `route-layer-${routeId}`;
    
    // Add source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geoJson
      });
      
      // Track the source for cleanup
      sourceIds.current.add(sourceId);
    } else {
      // Update the source if it exists
      map.getSource(sourceId).setData(geoJson);
    }
    
    // Add layer if it doesn't exist
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
          'visibility': 'visible'
        },
        paint: {
          'line-color': routeColors[difficulty] || routeColors.default,
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
      
      // Track the layer for cleanup
      layerIds.current.add(layerId);
      
      // Add hover effect
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty(layerId, 'line-width', 8);
      });
      
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty(layerId, 'line-width', 5);
      });
      
      // Add click handler
      map.on('click', layerId, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
        if (features.length > 0) {
          const clickedRouteId = features[0].properties.id;
          const clickedRoute = routes.find(r => r._id === clickedRouteId);
          if (clickedRoute) {
            setSelectedRoute(clickedRoute);
          }
        }
      });
    }
  };

  // Add start and end markers to a route
  const addRouteMarkers = (route, coordinates = null) => {
    // Use coordinates from parameters or from route
    const routeCoords = coordinates || route.path;
    if (!routeCoords || routeCoords.length === 0) return;
    
    // Get start and end coordinates
    const startCoords = routeCoords[0];
    const endCoords = routeCoords[routeCoords.length - 1];
    
    // Create markers
    const createMarker = (coords, isStart) => {
      // Create custom HTML element for marker
      const el = document.createElement('div');
      el.className = 'route-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isStart ? '#22c55e' : '#3b82f6';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      el.innerHTML = isStart ? 'S' : 'E';
      
      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false
      })
      .setHTML(`
        <div class="popup-content">
          <h3 class="font-bold">${route.name}</h3>
          <p>${isStart ? 'Starting Point' : 'End Point'}</p>
        </div>
      `);
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);
      
      // Store marker reference for cleanup
      markersRef.current.push(marker);
      
      return marker;
    };
    
    // Add markers
    createMarker(startCoords, true);
    createMarker(endCoords, false);
  };

  // Fit map to show the entire route
  const fitMapToRoute = (coordinates) => {
    if (!map || !coordinates || coordinates.length === 0) return;
    
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    
    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: isSidebarOpen ? 350 : 50, right: 50 }
    });
  };

  // Toggle route visibility
  const toggleRouteVisibility = (routeId) => {
    if (!map) return;
    
    const layerId = `route-layer-${routeId}`;
    
    if (map.getLayer(layerId)) {
      const currentVisibility = map.getLayoutProperty(layerId, 'visibility');
      const newVisibility = currentVisibility === 'visible' ? 'none' : 'visible';
      
      map.setLayoutProperty(layerId, 'visibility', newVisibility);
      
      // Update visible routes state
      setVisibleRoutes(prev => {
        const newSet = new Set(prev);
        if (newVisibility === 'visible') {
          newSet.add(routeId);
        } else {
          newSet.delete(routeId);
        }
        return newSet;
      });
    }
  };

  // Remove a route from the map
  const removeRoute = (routeId) => {
    if (!map) return;
    
    const layerId = `route-layer-${routeId}`;
    const sourceId = `route-source-${routeId}`;
    
    // Remove layer if it exists
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
      layerIds.current.delete(layerId);
    }
    
    // Remove source if it exists
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
      sourceIds.current.delete(sourceId);
    }
    
    // Remove from visible routes
    setVisibleRoutes(prev => {
      const newSet = new Set(prev);
      newSet.delete(routeId);
      return newSet;
    });
    
    // Clear selected route if it's the one being removed
    if (selectedRoute && selectedRoute._id === routeId) {
      setSelectedRoute(null);
    }
    
    // Remove associated markers
    const updatedMarkers = [];
    markersRef.current.forEach(marker => {
      // This is a simplified approach - in a real app you would need
      // a way to identify which markers belong to which route
      marker.remove();
    });
    markersRef.current = updatedMarkers;
  };

  // Show all routes or clear all routes
  const toggleAllRoutes = (showAll) => {
    if (showAll) {
      // Show all routes
      filteredRoutes.forEach(route => {
        if (!visibleRoutes.has(route._id)) {
          fetchAndDisplayGpx(route._id);
        }
      });
    } else {
      // Clear all routes
      visibleRoutes.forEach(routeId => {
        removeRoute(routeId);
      });
    }
  };

  // Format distance (meters to km)
  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return (meters / 1000).toFixed(1) + ' km';
  };

  // Format elevation (meters)
  const formatElevation = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return Math.round(meters) + ' m';
  };

  return (
    <div className="h-screen w-full bg-white relative flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-[#22c55e]">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-bold text-lg">Bike Routes</span>
              </Link>
            </div>
            
            <div className="relative w-full max-w-md mx-4">
              <input
                type="text"
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => toggleAllRoutes(true)}
                title="Show all routes"
              >
                <Eye className="h-5 w-5 text-[#6b7280]" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => toggleAllRoutes(false)}
                title="Clear all routes"
              >
                <Trash2 className="h-5 w-5 text-[#6b7280]" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <List className="h-5 w-5 text-[#6b7280]" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex relative">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading routes...</p>
            </div>
          </div>
        )}
        
        {/* GPX loading indicator */}
        {isGpxLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-20">
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading route data...</p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 z-20 px-4 py-2 rounded-lg shadow-lg">
            <p className="text-gray-700">{error}</p>
          </div>
        )}
        
        {/* Map container */}
        <div ref={mapContainer} className="w-full h-full z-0"></div>
        
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#1f2937]">Bike Routes</h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-[#6b7280]" />
              </button>
            </div>
            
            {/* Filters */}
            <div className="p-4 border-b">
              <h3 className="font-medium text-[#1f2937] mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </h3>
              
              <div className="space-y-3">
                {/* Difficulty filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                {/* Road type filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Road Type</label>
                  <select
                    value={roadTypeFilter}
                    onChange={(e) => setRoadTypeFilter(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All types</option>
                    <option value="paved">Paved</option>
                    <option value="gravel">Gravel</option>
                    <option value="trail">Trail</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                
                {/* Stats for visible routes */}
                {visibleRoutes.size > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700">
                      {visibleRoutes.size} {visibleRoutes.size === 1 ? 'route' : 'routes'} visible
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Routes list */}
            <div className="divide-y">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map(route => (
                  <div 
                    key={route._id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      selectedRoute && selectedRoute._id === route._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full flex-shrink-0 bg-opacity-10 flex items-center justify-center mr-2"
                           style={{ backgroundColor: `${routeColors[route.difficulty] || routeColors.default}20` }}>
                        <Bike className="h-5 w-5" style={{ color: routeColors[route.difficulty] || routeColors.default }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#1f2937]">{route.name}</h3>
                        <div className="flex items-center text-sm text-[#6b7280] mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            route.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            route.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{route.roadType || 'Mixed'}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {route.stats?.totalDistance ? 
                              formatDistance(route.stats.totalDistance * 1000) : 
                              'Distance N/A'}
                          </span>
                        </div>
                        {route.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {route.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex space-x-1">
                        <button
                          onClick={() => toggleRouteVisibility(route._id)}
                          className={`p-1 rounded-full ${visibleRoutes.has(route._id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                          title={visibleRoutes.has(route._id) ? "Hide route" : "Show route"}
                        >
                          {visibleRoutes.has(route._id) ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => fetchAndDisplayGpx(route._id)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          title="Load this route"
                        >
                          <Bike className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded details when selected */}
                    {selectedRoute && selectedRoute._id === route._id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium text-sm mb-2">Route Details</h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Distance</span>
                            <div className="font-medium">
                              {formatDistance(route.stats?.totalDistance * 1000 || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Elevation Gain</span>
                            <div className="font-medium">
                              {formatElevation(route.stats?.elevationGain || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Max Elevation</span>
                            <div className="font-medium">
                              {formatElevation(route.stats?.maxElevation || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">Road Type</span>
                            <div className="font-medium capitalize">
                              {route.roadType || 'Mixed'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <button 
                            onClick={() => {
                              if (route.path && route.path.length > 0) {
                                fitMapToRoute(route.path);
                              }
                            }}
                            className="flex-1 py-1.5 px-3 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Zoom to Route
                          </button>
                          <a 
                            href={config.getApiUrl(`bike-routes/${route._id}/gpx`)}
                            download={`${route.name}.gpx`}
                            className="flex-1 py-1.5 px-3 rounded-md text-xs flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download GPX
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-[#6b7280]">
                  {searchQuery || difficultyFilter !== 'all' || roadTypeFilter !== 'all' ? (
                    <p>No routes match your filters</p>
                  ) : (
                    <p>No bike routes available</p>
                  )}
                  <Link
                    to="/admin/bike-routes/new"
                    className="inline-flex items-center px-4 py-2 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#22c55e] hover:bg-[#16a34a]"
                  >
                    Add New Route
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <h3 className="text-sm font-medium mb-2">Difficulty Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: routeColors.easy }}></div>
              <span className="text-xs">Easy</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: routeColors.medium }}></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: routeColors.hard }}></div>
              <span className="text-xs">Hard</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .mapboxgl-popup-content {
          padding: 10px;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .popup-content h3 {
          margin: 0 0 5px 0;
          font-size: 14px;
          font-weight: 600;
        }
        
        .popup-content p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        
        .route-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .route-marker:hover {
          transform: scale(1.1);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GpxTrackMap;