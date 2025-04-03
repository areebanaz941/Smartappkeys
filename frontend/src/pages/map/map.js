import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as turf from '@turf/turf';
import { 
  ArrowLeft, 
  Search, 
  Layers, 
  Info, 
  X, 
  List, 
  MapPin,
  PersonStanding, 
  Bike, 
  Clock, 
  ArrowRight,
  Zap,
  Route,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import NavigationSidebar from '../navigation/NavigationSidebar';
import { useLocation } from 'react-router-dom';
import BikeRouteManagement from '../../components/admin/BikeRouteManagement';
// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibTJvdGVjaCIsImEiOiJjbTczbzU4aWQwMWdmMmpzY3N4ejJ3czlnIn0.fLDR4uG8kD8-g_IDM8ZPdQ';

const MapPage = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavigationSidebarOpen, setIsNavigationSidebarOpen] = useState(false);
  const [isRoutingPanelOpen, setIsRoutingPanelOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [pois, setPois] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeMode, setRouteMode] = useState('walking'); // 'walking' or 'cycling'
  const [routePreference, setRoutePreference] = useState('shortest'); // 'shortest' or 'fastest'
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [bikeRouteSearchQuery, setBikeRouteSearchQuery] = useState('');
  // Modified to support multiple waypoints
  const [waypoints, setWaypoints] = useState([]); // Array of points in route order
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0); // Index being selected
  const [isBikeRoutesPanelOpen, setIsBikeRoutesPanelOpen] = useState(false);
const [selectedBikeRoute, setSelectedBikeRoute] = useState(null);
  const [routeSelectionStep, setRouteSelectionStep] = useState(0); // 0: none, 1: selecting waypoints, 2: route calculated
  const [routeAlternatives, setRouteAlternatives] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [customPoints, setCustomPoints] = useState([]);
  const [mapClickEnabled, setMapClickEnabled] = useState(false);
  
  // Track click time for double-click detection
  const lastClickTime = useRef(0);
  const clickTimeout = useRef(null);
  
  // Use a ref for markers to avoid dependency issues in cleanup
  const markersRef = useRef([]);
  const waypointMarkersRef = useRef([]);
  const hoverPopupRef = useRef(null);
  // Add these state variables to your MapPage component
const [bikeRoutes, setBikeRoutes] = useState([]);

const [isBikeRoutesLoading, setIsBikeRoutesLoading] = useState(false);

const [isGpxLoading, setIsGpxLoading] = useState(false);


const location = useLocation();


  // Fetch POIs from API
  useEffect(() => {
      // Ensure token is set before map creation
      if (!mapboxgl.accessToken || mapboxgl.accessToken === '') {
        mapboxgl.accessToken = 'pk.eyJ1IjoibTJvdGVjaCIsImEiOiJjbTczbzU4aWQwMWdmMmpzY3N4ejJ3czlnIn0.fLDR4uG8kD8-g_IDM8ZPdQ';
        console.log('Access token reset:', mapboxgl.accessToken);
      }
      
      // Default center (San Lorenzo Nuovo)
      const defaultCenter = [11.907, 42.685]; // [lng, lat] for Mapbox GL
      
      // Find coordinates from first POI if available
      let center = defaultCenter;
      const firstPoi = pois[0];
      
      if (firstPoi && firstPoi.coordinates) {
        // Parse coordinates based on their format
        if (typeof firstPoi.coordinates === 'string') {
          const coords = firstPoi.coordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (coords.length === 2) {
            center = [coords[1], coords[0]]; // [lng, lat] for Mapbox GL
          }
        } else if (firstPoi.coordinates.lat && firstPoi.coordinates.lng) {
          center = [firstPoi.coordinates.lng, firstPoi.coordinates.lat]; // [lng, lat] for Mapbox GL
        }
      }
      
      console.log('Map center coordinates:', center);
      
      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center, // Now center is properly defined
        zoom: 14
      });
    const fetchPois = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://smartappkeys-1.onrender.com/api/pois');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch POIs');
        }
        
        setPois(data.data || []);
        console.log('POIs loaded:', data.data?.length || 0);
      } catch (err) {
        console.error('Error fetching POIs:', err);
        setError(`Failed to load POIs: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPois();
  }, []);

  useEffect(() => {
    // Check for route parameter in URL
    const params = new URLSearchParams(location.search);
    const routeId = params.get('route');
    
    if (routeId && map) {
      // If we have both a route ID and map is ready, open the bike routes panel
      setIsBikeRoutesPanelOpen(true);
    }
  }, [location.search, map]);

  // Convert meters to kilometers with 1 decimal place
  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  // Convert seconds to minutes and hours format
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };

  // Helper function to create a custom point object from map coordinates
  const createCustomPoint = (lngLat, index) => {
    const id = `custom-${Date.now()}-${index}`;
    return {
      _id: id,
      name_en: index === 0 ? 'Starting Point' : (index === waypoints.length ? 'Destination' : `Waypoint ${index}`),
      type_en: 'Custom Location',
      coordinates: {
        lng: lngLat.lng,
        lat: lngLat.lat
      },
      custom: true
    };
  };

  // Helper to convert POI coordinates to Mapbox format
  const getMapboxCoords = (poi) => {
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

  // Function to add a waypoint marker to the map
  const addWaypointMarker = (point, index) => {
    if (!map) return null;
    
    // Get coordinates in the right format
    const coords = getMapboxCoords(point);
    if (!coords) return null;
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'waypoint-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.borderRadius = '50%';
    
    // Color based on position in route
    let color;
    if (index === 0) {
      color = '#22c55e'; // Green for starting point
    } else if (index === waypoints.length - 1) {
      color = '#3b82f6'; // Blue for destination
    } else {
      color = '#f59e0b'; // Amber for waypoints
    }
    
    el.style.backgroundColor = color;
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    el.style.cursor = 'pointer';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = 'white';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '12px';
    el.innerText = (index + 1).toString();
    
    // Add marker to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat(coords)
      .addTo(map);
    
    // Add popup with waypoint info
    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false
    })
    .setHTML(`
      <div class="popup-content">
        <h3 class="font-bold">${point.name_en}</h3>
        <p>${index === 0 ? 'Starting Point' : (index === waypoints.length - 1 ? 'Destination' : `Waypoint ${index}`)}</p>
      </div>
    `);
    
    marker.setPopup(popup);
    
    // Add to ref
    waypointMarkersRef.current.push(marker);
    
    return marker;
  };

  // Clear all waypoint markers
  const clearWaypointMarkers = () => {
    waypointMarkersRef.current.forEach(marker => {
      if (marker) marker.remove();
    });
    waypointMarkersRef.current = [];
  };

  // Function to render waypoint markers
  const renderWaypointMarkers = () => {
    clearWaypointMarkers();
    
    waypoints.forEach((point, index) => {
      addWaypointMarker(point, index);
    });
  };

  // Update markers when waypoints change
  useEffect(() => {
    renderWaypointMarkers();
  }, [waypoints, map]);

  // Add a custom marker for map clicks
  const addCustomMarker = (lngLat) => {
    // Create custom point object
    const customPoint = createCustomPoint(lngLat, currentWaypointIndex);
    
    // Add to waypoints at current index
    const newWaypoints = [...waypoints];
    newWaypoints[currentWaypointIndex] = customPoint;
    setWaypoints(newWaypoints);
    
    // Move to next waypoint selection if needed
    if (currentWaypointIndex === 0) {
      setError("Select your destination");
      setCurrentWaypointIndex(1);
    } else if (currentWaypointIndex === 1 && waypoints.length <= 2) {
      // If we're selecting the destination (second point)
      setRouteSelectionStep(2);
      setError(null);
      fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
    }
    
    return customPoint;
  };

  // Function to handle POI selection for waypoints
  const selectPoiAsWaypoint = (poi) => {
    const newWaypoints = [...waypoints];
    newWaypoints[currentWaypointIndex] = poi;
    setWaypoints(newWaypoints);
    
    // Move to next waypoint selection if needed
    if (currentWaypointIndex === 0) {
      setError("Select your destination");
      setCurrentWaypointIndex(1);
    } else if (currentWaypointIndex === 1 && waypoints.length <= 2) {
      // If we're selecting the destination (second point)
      setRouteSelectionStep(2);
      setError(null);
      fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
    }
  };

  // Fetch route with multiple waypoints
  const fetchMultiPointRoute = async (points, mode, preference) => {
    if (!points || points.length < 2) return;
    
    try {
      setIsRoutingLoading(true);
      setRouteAlternatives([]);
      
      // Convert all waypoints to coordinates strings
      const coordinatesStrings = points.map(point => {
        const coords = getMapboxCoords(point);
        if (!coords) throw new Error(`Invalid coordinates for waypoint: ${point.name_en}`);
        return `${coords[0]},${coords[1]}`;
      });
      
      // Build the coordinates string for the API
      const coordinatesPath = coordinatesStrings.join(';');
      
      // Prepare options based on preference
      const alternatives = preference === 'shortest' ? 'false' : 'true';
      
      // Make API call to Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coordinatesPath}?alternatives=${alternatives}&geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }
      
      // If we have multiple routes (alternatives)
      if (data.routes.length > 1) {
        setRouteAlternatives(data.routes);
        
        // Use the first route by default
        const primaryRoute = data.routes[0];
        displayRoute(primaryRoute, points, mode);
        setSelectedRouteIndex(0);
      } else {
        // Single route
        const route = data.routes[0];
        displayRoute(route, points, mode);
        setRouteAlternatives([route]);
        setSelectedRouteIndex(0);
      }
      
    } catch (error) {
      console.error('Error fetching route:', error);
      setError(`Failed to get directions: ${error.message}`);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  // Display a route on the map
  const displayRoute = (route, waypoints, mode) => {
    if (!map) return;
    
    // Clear previous route
    clearRouteDisplay();
    
    // Add the route source and layer
    if (!map.getSource('route')) {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });
    } else {
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      });
    }
    
    if (!map.getLayer('route')) {
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': mode === 'walking' ? '#22c55e' : '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    
    // Fit map to show the entire route
    const coordinates = route.geometry.coordinates;
    
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    if (coordinates && coordinates.length >= 2) {
      const bounds = coordinates.reduce((bounds, coord) => {
        if (coord && Array.isArray(coord) && coord.length >= 2) {
          return bounds.extend(coord);
        }
        return bounds;
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    }
    map.fitBounds(bounds, {
      padding: 100
    });
    
    // Store route information
    setRouteInfo({
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      mode: mode,
      steps: route.legs.flatMap(leg => leg.steps), // Combine steps from all legs
      legs: route.legs, // Store individual legs
      geometry: route.geometry // Store route geometry for export
    });
  };

  // Export route as GeoJSON
  const exportRouteAsGeoJSON = () => {
    if (!routeInfo || !routeInfo.geometry) return;
    
    const geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "Route",
            mode: routeMode,
            distance: routeInfo.distance,
            duration: routeInfo.duration
          },
          geometry: routeInfo.geometry
        },
        ...waypoints.map((waypoint, index) => {
          const coords = getMapboxCoords(waypoint);
          return {
            type: "Feature",
            properties: {
              name: waypoint.name_en,
              index: index,
              type: index === 0 ? "origin" : 
                    index === waypoints.length - 1 ? "destination" : 
                    "waypoint"
            },
            geometry: {
              type: "Point",
              coordinates: coords
            }
          };
        })
      ]
    };
    
    // Convert to JSON string
    const geojsonString = JSON.stringify(geojson, null, 2);
    
    // Create a blob and download
    const blob = new Blob([geojsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route_${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Switch to a different route alternative
  const switchRouteAlternative = (index) => {
    if (!routeAlternatives[index]) return;
    
    setSelectedRouteIndex(index);
    const route = routeAlternatives[index];
    
    displayRoute(route, waypoints, routeMode);
  };

  // Toggle between walking and cycling modes
  const toggleRouteMode = () => {
    const newMode = routeMode === 'walking' ? 'cycling' : 'walking';
    setRouteMode(newMode);
    
    // If there's already a selected route, update it
    if (waypoints.length >= 2) {
      fetchMultiPointRoute(waypoints, newMode, routePreference);
    }
  };

  // Toggle between shortest and fastest routes
  const toggleRoutePreference = () => {
    const newPreference = routePreference === 'shortest' ? 'fastest' : 'shortest';
    setRoutePreference(newPreference);
    
    // If there's already a selected route, update it
    if (waypoints.length >= 2) {
      fetchMultiPointRoute(waypoints, routeMode, newPreference);
    }
  };

  // Add a new waypoint to the route
  const addWaypoint = () => {
    // Add new waypoint before destination
    const newIndex = Math.max(waypoints.length - 1, 1);
    setCurrentWaypointIndex(newIndex);
    
    // Insert null placeholder
    const newWaypoints = [...waypoints];
    newWaypoints.splice(newIndex, 0, null);
    setWaypoints(newWaypoints);
    
    setError("Select the new waypoint");
    setRouteSelectionStep(1);
  };

  // Remove a waypoint from the route
  const removeWaypoint = (index) => {
    if (waypoints.length <= 2 || index < 0 || index >= waypoints.length) return;
    
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
    
    // Recalculate route if we still have origin and destination
    if (newWaypoints.length >= 2 && !newWaypoints.includes(null)) {
      fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
    }
  };

  // Reorder waypoints (e.g., for drag and drop functionality)
  const reorderWaypoints = (fromIndex, toIndex) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= waypoints.length || toIndex >= waypoints.length) return;
    
    const newWaypoints = [...waypoints];
    const [movedItem] = newWaypoints.splice(fromIndex, 1);
    newWaypoints.splice(toIndex, 0, movedItem);
    
    setWaypoints(newWaypoints);
    
    // Recalculate route
    if (newWaypoints.length >= 2 && !newWaypoints.includes(null)) {
      fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
    }
  };

  // Clear route display from map
  const clearRouteDisplay = () => {
    if (!map) return;
    
    // Remove route layer and source
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route');
    }
  };
// Function to fetch all bike routes
const fetchBikeRoutes = async () => {
  try {
    setIsBikeRoutesLoading(true);
    const response = await fetch('https://smartappkeys-1.onrender.com/api/bike-routes');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch bike routes');
    }
    
    console.log('Bike routes data details:', data.data.map(route => ({
      id: route._id,
      name: route.name,
      hasGpx: !!route.gpxFile // Check if gpxFile exists
    })));
    
    setBikeRoutes(data.data || []);
    console.log('Bike routes loaded:', data.data?.length || 0);
  } catch (err) {
    console.error('Error fetching bike routes:', err);
    setError(`Failed to load bike routes: ${err.message}`);
  } finally {
    setIsBikeRoutesLoading(false);
  }
};

// Function to fetch a specific bike route
const fetchBikeRoute = async (routeId) => {
  try {
    const response = await fetch(`https://smartappkeys-1.onrender.com/api/bike-routes/${routeId}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch bike route');
    }
    
    return data.data;
  } catch (err) {
    console.error('Error fetching bike route:', err);
    setError(`Failed to load bike route: ${err.message}`);
    return null;
  }
};

// Function to download and parse a GPX file
const downloadGpxFile = async (routeId) => {
  try {
    setIsGpxLoading(true);
    console.log(`Attempting to download GPX for route ID: ${routeId}`);
    
    // Fetch route details first
    const route = await fetchBikeRoute(routeId);
    if (!route) {
      throw new Error('Failed to fetch route details');
    }
    
    console.log('Route details:', route);
    
    // Check if route has a GPX file
    if (!route.gpxFile) {
      console.error('No GPX file associated with this route');
      throw new Error('No GPX file associated with this route');
    }
    
    console.log('GPX file path:', route.gpxFile);
    
    // Download the GPX file
    const response = await fetch(`https://smartappkeys-1.onrender.com/api/bike-routes/${routeId}/gpx`);
    
    console.log('GPX download response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to download GPX file: ${response.status}`);
    }
    
    const gpxText = await response.text();
    console.log('GPX text length:', gpxText.length);
    console.log('First 100 chars of GPX:', gpxText.substring(0, 100));
    
    // Set the selected route
    setSelectedBikeRoute(route);
    
    // Parse and display the GPX file
    displayGpxOnMap(gpxText, route);
    
  } catch (err) {
    console.error('Error downloading GPX file:', err);
    setError(`Failed to load GPX: ${err.message}`);
  } finally {
    setIsGpxLoading(false);
  }
};

// Function to parse and display GPX on the map
const displayGpxOnMap = (gpxText, route) => {
  if (!map || !gpxText) {
    console.error('Cannot display GPX: map or gpxText is missing');
    return;
  }
  
  try {
    console.log('Starting GPX parse and display process');
    
    // Parse GPX text
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, 'text/xml');
    
    // Log the parsed document
    console.log('GPX document parsed:', gpxDoc);
    
    // Extract track points
    const trackPoints = [];
    const trkpts = gpxDoc.querySelectorAll('trkpt');
    
    console.log('Number of track points found:', trkpts.length);
    
    trkpts.forEach((trkpt, index) => {
      const lat = parseFloat(trkpt.getAttribute('lat'));
      const lon = parseFloat(trkpt.getAttribute('lon'));
      const ele = trkpt.querySelector('ele') ? parseFloat(trkpt.querySelector('ele').textContent) : 0;
      
      if (!isNaN(lat) && !isNaN(lon)) {
        trackPoints.push([lon, lat, ele]);
      }
      
      // Log a sample of the first few points
      if (index < 3) {
        console.log(`Track point ${index}:`, { lat, lon, ele });
      }
    });
    
    console.log('Processed track points:', trackPoints.length);
    
    if (trackPoints.length === 0) {
      throw new Error('No valid track points found in GPX');
    }
    
    // Clear any existing route
    clearRouteDisplay();
    clearWaypointMarkers();
    
    // Create GeoJSON from track points
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: trackPoints
      }
    };
    
    console.log('GeoJSON created:', geojson);
    
    // Add the route to the map
    if (!map.getSource('gpx-route')) {
      console.log('Creating new source for GPX route');
      map.addSource('gpx-route', {
        type: 'geojson',
        data: geojson
      });
    } else {
      console.log('Updating existing GPX route source');
      map.getSource('gpx-route').setData(geojson);
    }
    
    // Add line layer if it doesn't exist
    if (!map.getLayer('gpx-route')) {
      console.log('Creating new layer for GPX route');
      map.addLayer({
        id: 'gpx-route',
        type: 'line',
        source: 'gpx-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6', // Blue color
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    
    console.log('Fitting map to GPX route bounds');
    
    // Fit map to show the entire route
    const bounds = trackPoints.reduce((bounds, coord) => {
      return bounds.extend([coord[0], coord[1]]);
    }, new mapboxgl.LngLatBounds(trackPoints[0], trackPoints[0]));
    
    map.fitBounds(bounds, {
      padding: 100
    });
    
    console.log('GPX route display completed successfully');
    
    // The rest of the function remains unchanged...
    
  } catch (err) {
    console.error('Error parsing or displaying GPX:', err);
    setError(`Failed to parse GPX: ${err.message}`);
  }
};

// Helper function to calculate route distance from coordinates
const calculateRouteDistance = (coordinates) => {
  let distance = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    // Calculate distance between consecutive points
    const start = turf.point([coordinates[i-1][0], coordinates[i-1][1]]);
    const end = turf.point([coordinates[i][0], coordinates[i][1]]);
    distance += turf.distance(start, end, {units: 'kilometers'}) * 1000; // Convert to meters
  }
  
  return distance;
};
const filteredBikeRoutes = bikeRoutes.filter(route => 
  !bikeRouteSearchQuery ||
  route.name?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase()) ||
  route.description?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase()) ||
  route.tags?.some(tag => tag.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase())) ||
  route.startPoint?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase()) ||
  route.endPoint?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase())
);
// Helper function to calculate elevation gain from coordinates
const calculateElevationGain = (coordinates) => {
  let gain = 0;
  
  for (let i = 1; i < coordinates.length; i++) {
    const prevEle = coordinates[i-1][2] || 0;
    const currentEle = coordinates[i][2] || 0;
    
    // Only count positive elevation changes
    if (currentEle > prevEle) {
      gain += currentEle - prevEle;
    }
  }
  
  return gain;
};

// Helper function to estimate route duration based on distance and difficulty
const estimateRouteDuration = (distance, difficulty) => {
  // Average speeds in meters per second
  const speeds = {
    easy: 3.5,     // 12.6 km/h
    medium: 3.0,   // 10.8 km/h
    hard: 2.5      // 9.0 km/h
  };
  
  const speed = speeds[difficulty] || speeds.medium;
  
  // Calculate duration in seconds
  return distance / speed;
};
const debugLoadFirstGpx = () => {
  if (bikeRoutes.length > 0) {
    const firstRoute = bikeRoutes[0];
    console.log('Manually loading first route:', firstRoute);
    downloadGpxFile(firstRoute._id);
  } else {
    console.error('No bike routes available to load');
  }
};

// Add this useEffect to load bike routes
// Add this useEffect to load bike routes
useEffect(() => {
  fetchBikeRoutes();
  
  // Check for route parameter in URL
  const params = new URLSearchParams(location.search);
  const routeId = params.get('route');
  
  console.log('Map initialized:', map ? 'Yes' : 'No');
  console.log('URL route parameter:', routeId);
  
  if (routeId && map) {
    // Only download if map is ready
    downloadGpxFile(routeId);
  } else if (routeId) {
    console.log('Waiting for map to initialize before loading route:', routeId);
    // Set a flag to load when map is ready
    const routeToLoad = routeId;
    // You might want to add a state variable to track this
  }
}, [location.search, map]); // Add map as a dependency

// You can add this separate useEffect for debugging if needed
useEffect(() => {
  console.log("Fetched bike routes:", bikeRoutes);
}, [bikeRoutes]);

// Clear GPX route display
const clearGpxDisplay = () => {
  if (!map) return;
  
  // Remove route layer and source
  if (map.getLayer('gpx-route')) {
    map.removeLayer('gpx-route');
  }
  if (map.getSource('gpx-route')) {
    map.removeSource('gpx-route');
  }
  
  setSelectedBikeRoute(null);
};

// Update the clearRoute function to also clear GPX data
const clearRoute = () => {
  clearRouteDisplay();
  clearGpxDisplay();
  clearWaypointMarkers();
  setRouteInfo(null);
  setWaypoints([]);
  setCurrentWaypointIndex(0);
  setRouteAlternatives([]);
  setSelectedRouteIndex(0);
  setRouteSelectionStep(0);
  setCustomPoints([]);
  setSelectedBikeRoute(null);
};


  // Enable map click for custom point selection
  const enableMapClick = () => {
    setMapClickEnabled(true);
    setError("Click anywhere on the map to set your starting point");
  };

  // Start route planning mode
  const startRoutePlanning = () => {
    setIsRoutingPanelOpen(true);
    clearRoute();
    setRouteSelectionStep(0);
    setWaypoints([null, null]); // Initial setup for origin and destination
    setCurrentWaypointIndex(0);
    setMapClickEnabled(true);
    setError("Select your starting point");
  };

  // Toggle navigation sidebar
  const toggleNavigationSidebar = () => {
    setIsNavigationSidebarOpen(!isNavigationSidebarOpen);
  };

  // Handle map clicks for route selection
  const handleMapClick = (poi) => {
    if (!isRoutingPanelOpen) {
      // Normal POI selection
      setSelectedPlace(poi);
      setIsSidebarOpen(true);
      return;
    }
    
    // Route selection process
    selectPoiAsWaypoint(poi);
  };

  // Handle direct map clicks (not on POI markers)
  useEffect(() => {
    if (map && mapClickEnabled) {
      const onClick = (e) => {
        // We only want to handle clicks directly on the map, not on markers
        const isMarkerClick = e.originalEvent.target.closest('.marker') || 
                           e.originalEvent.target.closest('.waypoint-marker');
        
        if (!isMarkerClick) {
          const lngLat = e.lngLat;
          
          // Add to waypoints
          addCustomMarker(lngLat);
        }
      };
      
      map.on('click', onClick);
      
      return () => {
        map.off('click', onClick);
      };
    }
  }, [map, mapClickEnabled, currentWaypointIndex, waypoints, routeMode, routePreference]);

  // Visual indicator when map click is enabled
  useEffect(() => {
    if (map) {
      if (mapClickEnabled) {
        // Change cursor to crosshair when map click is enabled
        map.getCanvas().style.cursor = 'crosshair';
      } else {
        map.getCanvas().style.cursor = '';
      }
    }
  }, [map, mapClickEnabled]);
  
  // Initialize Mapbox GL map once POIs are loaded
  useEffect(() => {
    // Only create map if it doesn't exist, we have POIs, loading is done, 
    // and the container is available
    if (!map && pois.length > 0 && !isLoading && mapContainer.current) {
      // Make sure the container is empty
      if (mapContainer.current) {
        while (mapContainer.current.firstChild) {
          mapContainer.current.removeChild(mapContainer.current.firstChild);
        }
      }
      
      // Default center (San Lorenzo Nuovo)
      const defaultCenter = [11.907, 42.685]; // [lng, lat] for Mapbox GL
      
      // Find coordinates from first POI if available
      let center = defaultCenter;
      const firstPoi = pois[0];
      
      if (firstPoi && firstPoi.coordinates) {
        // Parse coordinates based on their format
        if (typeof firstPoi.coordinates === 'string') {
          const coords = firstPoi.coordinates.split(',').map(coord => parseFloat(coord.trim()));
          if (coords.length === 2) {
            center = [coords[1], coords[0]]; // [lng, lat] for Mapbox GL
          }
        } else if (firstPoi.coordinates.lat && firstPoi.coordinates.lng) {
          center = [firstPoi.coordinates.lng, firstPoi.coordinates.lat]; // [lng, lat] for Mapbox GL
        }
      }
      
      try {
        // Create map instance
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: center,
          zoom: 14
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
        
        // Add POI markers when map loads
        mapInstance.on('load', () => {
          const newMarkers = [];
          
          // Add markers for each POI
          pois.forEach(poi => {
            // Parse coordinates
            let lat, lng;
            
            if (typeof poi.coordinates === 'string') {
              const coords = poi.coordinates.split(',').map(coord => parseFloat(coord.trim()));
              if (coords.length === 2) {
                [lat, lng] = coords;
              }
            } else if (poi.coordinates && poi.coordinates.lat && poi.coordinates.lng) {
              lat = poi.coordinates.lat;
              lng = poi.coordinates.lng;
            }
            
            if (!lat || !lng) {
              console.warn(`Invalid coordinates for POI: ${poi.name_en}`);
              return;
            }
            
            // Create custom HTML element for marker
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url('/pointer.png')`;
            el.style.width = '60px';
            el.style.height = '60px';
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.cursor = 'pointer';
            
            // Add category class for filtering
            el.classList.add(`category-${poi.category || 'default'}`);
            
            // Create minimal popup for click (only name, no hover functionality)
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
            const marker = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(mapInstance);
            
            // Handle marker hover
            el.addEventListener('mouseenter', () => {
              // Remove any existing hover popup
              if (hoverPopupRef.current) {
                hoverPopupRef.current.remove();
                hoverPopupRef.current = null;
              }
              
              // Create hover popup with more details
              const hoverPopup = new mapboxgl.Popup({ 
                offset: 25,
                closeButton: false,
                closeOnClick: false,
                className: 'hover-popup'
              })
              .setLngLat([lng, lat])
              .setHTML(`
                <div class="hover-popup-content">
                  <div class="flex">
                    <div class="mr-2 w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      ${poi.photo ? 
                        `<img src="${poi.photo}" alt="${poi.name_en}" class="w-full h-full object-cover" 
                         onerror="this.onerror=null;this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'64\\' height=\\'64\\' viewBox=\\'0 0 64 64\\'%3E%3Crect width=\\'64\\' height=\\'64\\' fill=\\'%23f1f1f1\\'/%3E%3Ctext x=\\'50%\\' y=\\'50%\\' font-family=\\'Arial\\' font-size=\\'8\\' text-anchor=\\'middle\\' fill=\\'%23999\\'%3ENo Image%3C/text%3E%3C/svg%3E';">` :
                        `<div class="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </div>`
                      }
                    </div>
                    <div>
                      <h3 class="font-bold text-base">${poi.name_en}</h3>
                      <p class="text-sm text-gray-600 capitalize">${poi.category ? poi.category.replace('_', ' ') : poi.type_en}</p>
                      ${poi.description_en ? 
                        `<p class="text-xs text-gray-500 mt-1 max-w-[200px] line-clamp-2">${poi.description_en}</p>` : 
                        ''
                      }
                    </div>
                  </div>
                </div>
              `);
              
              hoverPopup.addTo(mapInstance);
              hoverPopupRef.current = hoverPopup;
              setHoveredPlace(poi);
            });
            
            // Handle mouse leave
            el.addEventListener('mouseleave', () => {
              // Give a small delay before removing the popup
              setTimeout(() => {
                if (hoverPopupRef.current) {
                  hoverPopupRef.current.remove();
                  hoverPopupRef.current = null;
                }
                setHoveredPlace(null);
              }, 100);
            });
            
            // Handle click with double-click detection
            el.addEventListener('click', (e) => {
              const currentTime = new Date().getTime();
              const timeDiff = currentTime - lastClickTime.current;
              
              // Clear any existing timeout
              if (clickTimeout.current) {
                clearTimeout(clickTimeout.current);
                clickTimeout.current = null;
              }
              
              // This continues from "// If the time difference is less than" in the click handler

              // If the time difference is less than 300ms, it's a double-click
              if (timeDiff < 300) {
                // Double-click - deselect
                if (!isRoutingPanelOpen) {
                  setSelectedPlace(null);
                  setIsSidebarOpen(false);
                }
                
                // If there's a hover popup, remove it
                if (hoverPopupRef.current) {
                  hoverPopupRef.current.remove();
                  hoverPopupRef.current = null;
                }

                // Remove any popups
                marker.getPopup().remove();

                // Don't clear route on double-click when in routing mode
                if (!isRoutingPanelOpen) {
                  clearRoute();
                }
              } else {
                // Single click - wait a bit to see if there's a double click
                clickTimeout.current = setTimeout(() => {
                  // Handle POI selection differently in routing mode
                  if (isRoutingPanelOpen) {
                    // If in routing mode, select this POI as a waypoint
                    selectPoiAsWaypoint(poi);
                  } else {
                    // Normal POI selection behavior
                    setSelectedPlace(poi);
                    setIsSidebarOpen(true);
                  }
                  
                  // Show the popup for a short time then close it
                  marker.togglePopup();
                  setTimeout(() => {
                    marker.getPopup().remove();
                  }, 1500);
                }, 200);
              }

              lastClickTime.current = currentTime;
            });

            newMarkers.push(marker);
          });

          // Store markers in ref
          markersRef.current = newMarkers;
        });

        setMap(mapInstance);
      } catch (mapError) {
        console.error('Error initializing map:', mapError);
        setError(`Failed to initialize map: ${mapError.message}`);
      }
    }

    // Cleanup function with improved error handling
    return () => {
      // Clear all markers first
      if (markersRef.current.length > 0) {
        try {
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          markersRef.current = [];
        } catch (e) {
          console.warn('Error cleaning up markers:', e);
        }
      }
      
      // Clear any waypoint markers
      clearWaypointMarkers();
      
      // Clear any hover popup
      if (hoverPopupRef.current) {
        try {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        } catch (e) {
          console.warn('Error cleaning up hover popup:', e);
        }
      }
      
      // Only attempt full cleanup if we have a map reference
      if (map) {
        try {
          // Clear any route data
          clearRouteDisplay();
          
          // Get the container element
          const container = map.getContainer();
          
          // Try to remove event listeners and prevent future callbacks
          map._listeners = [];
          map._controls = [];
          map.dragPan.disable();
          map.scrollZoom.disable();
          map.dragRotate.disable();
          
          // Remove the map's canvas from the DOM without calling map.remove()
          const canvas = container.querySelector('.mapboxgl-canvas-container');
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
          
          // Remove all children from the container
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          
          // Replace with a dummy div to ensure React doesn't complain
          const placeholder = document.createElement('div');
          placeholder.style.width = '100%';
          placeholder.style.height = '100%';
          container.appendChild(placeholder);
        } catch (e) {
          console.warn('Error cleaning up map elements:', e);
        }
        
        // Always reset the state variable
        setMap(null);
      }
      
      // Clear any pending timeouts
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }
    };
  }, [pois, isLoading, map, isRoutingPanelOpen]);

  // Handler to center the map on a POI
  const centerMapOnPoi = (poi) => {
    if (!map || !poi) return;
    
    let lat, lng;
    if (typeof poi.coordinates === 'string') {
      const coords = poi.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coords.length === 2) {
        [lat, lng] = coords;
      }
    } else if (poi.coordinates && poi.coordinates.lat && poi.coordinates.lng) {
      lat = poi.coordinates.lat;
      lng = poi.coordinates.lng;
    }
    
    if (lat && lng) {
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true
      });
    }
  };

  // Filter POIs based on search query
  const filteredPlaces = pois.filter(poi => 
    poi.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poi.name_it?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poi.type_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poi.type_it?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    poi.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

return (
      <div className="h-screen w-full bg-white relative flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center text-[#22c55e]">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-bold text-lg">Smart Travel</span>
                </Link>
              </div>
              
              <div className="relative w-full max-w-md mx-4">
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 relative"
                  onClick={startRoutePlanning}
                >
                  <Route className="h-5 w-5 text-[#6b7280]" />
                  {isRoutingPanelOpen && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[#22c55e] rounded-full"></span>
                  )}
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={toggleNavigationSidebar}
                >
                  <Layers className="h-5 w-5 text-[#6b7280]" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Info className="h-5 w-5 text-[#6b7280]" />
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
                <p className="mt-2 text-gray-600">Loading POIs...</p>
              </div>
            </div>
          )}
          
          {/* Routing loading indicator */}
          {isRoutingLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-20">
              <div className="text-center bg-white p-4 rounded-lg shadow-md">
                <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Calculating route...</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 z-20 px-4 py-2 rounded-lg shadow-lg">
              <p className="text-gray-700">{error}</p>
            </div>
          )}
          
          {/* Map container - using ref instead of id */}
          <div ref={mapContainer} className="w-full h-full z-0"></div>
    
          {/* Navigation Sidebar - Include the imported component */}
          {isNavigationSidebarOpen && (
  <NavigationSidebar 
    onClose={() => setIsNavigationSidebarOpen(false)}
    waypoints={waypoints}
    routeInfo={routeInfo}
    routeMode={routeMode}
    routePreference={routePreference}
    routeSelectionStep={routeSelectionStep}
    routeAlternatives={routeAlternatives}
    selectedRouteIndex={selectedRouteIndex}
    currentWaypointIndex={currentWaypointIndex}
    onRoutePreferenceToggle={toggleRoutePreference}
    onRouteModeToggle={toggleRouteMode}
    onWaypointRemove={removeWaypoint}
    onAddWaypoint={addWaypoint}
    onClearRoute={clearRoute}
    onExportRoute={exportRouteAsGeoJSON}
    onWaypointReorder={reorderWaypoints}
    onRouteAlternativeSelect={switchRouteAlternative}
  />
)}
          
          {/* Routing Panel Sidebar */}
          {isRoutingPanelOpen && (
            <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
              <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1f2937]">Route Planner</h2>
                <button 
                  onClick={() => {
                    setIsRoutingPanelOpen(false);
                    clearRoute();
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-[#6b7280]" />
                </button>
              </div>
              
              
              {/* Route Selection Progress */}
              <div className="p-4 border-b">
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${waypoints[0] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    1
                  </div>
                  <div className="flex-1 h-1 mx-2 bg-gray-200">
                    <div className={`h-full ${waypoints[0] ? 'bg-green-500' : 'bg-gray-200'}`} style={{ width: `${waypoints[0] ? '100%' : '0%'}` }}></div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${waypoints.length > 1 && waypoints[waypoints.length - 1] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {waypoints.length}
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
                    onClick={toggleRouteMode}
                    className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
                      routeMode === 'walking' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <PersonStanding className="h-4 w-4" />
                    <span>Walking</span>
                  </button>
                  
                  <button
                    onClick={toggleRouteMode}
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
                    onClick={toggleRoutePreference}
                    className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
                      routePreference === 'shortest' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Route className="h-4 w-4" />
                    <span>Shortest</span>
                  </button>

                  <button 
  className="p-2 rounded-full hover:bg-gray-100 relative"
  onClick={() => setIsBikeRoutesPanelOpen(!isBikeRoutesPanelOpen)}
  title="Bike Routes"
>
  <Bike className="h-5 w-5 text-[#6b7280]" />
  {isBikeRoutesPanelOpen && (
    <span className="absolute top-0 right-0 w-2 h-2 bg-[#22c55e] rounded-full"></span>
  )}
</button>
                  
                  <button
                    onClick={toggleRoutePreference}
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
                    onClick={addWaypoint}
                    className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={routeSelectionStep < 2}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Stop</span>
                  </button>
                  
                  <button
                    onClick={clearRoute}
                    className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200"
                    disabled={routeSelectionStep < 2}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                  
                  {routeInfo && (
                    <button
                      onClick={exportRouteAsGeoJSON}
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
                        {waypoints.length > 2 && index !== 0 && index !== waypoints.length - 1 && (
                          <button 
                            onClick={() => removeWaypoint(index)}
                            className="p-1 rounded-full hover:bg-gray-200"
                            title="Remove waypoint"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
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
                      <div className="text-gray-500 text-xs mb-1">Distance</div>
                      <div className="font-semibold text-gray-900">{formatDistance(routeInfo.distance)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-gray-500 text-xs mb-1">Estimated Time</div>
                      <div className="font-semibold text-gray-900">{formatDuration(routeInfo.duration)}</div>
                    </div>
                  </div>
                  
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
                            onClick={() => switchRouteAlternative(index)}
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
          )}
          
          {/* POIs Sidebar - kept on RIGHT side */}
          {isSidebarOpen && (
            <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
              <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h2 className="font-bold text-lg text-[#1f2937]">Points of Interest</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-[#6b7280]" />
                </button>
              </div>
              
              {selectedPlace ? (
                <div className="p-4">
                  <div className="mb-4">
                    <button 
                      onClick={() => {
                        setSelectedPlace(null);
                        if (!isRoutingPanelOpen) {
                          clearRoute();
                        }
                      }}
                      className="text-[#22c55e] flex items-center text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to list
                    </button>
                  </div>
                  <h3 className="font-bold text-xl text-[#1f2937] mb-2">{selectedPlace.name_en}</h3>
                  {selectedPlace.name_it && selectedPlace.name_it !== selectedPlace.name_en && (
                    <p className="text-sm text-[#6b7280] mb-2">{selectedPlace.name_it}</p>
                  )}
                  
                  <p className="text-sm text-[#6b7280] mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e] capitalize">
                      {selectedPlace.category ? selectedPlace.category.replace('_', ' ') : selectedPlace.type_en}
                    </span>
                    {selectedPlace.type_it && selectedPlace.type_it !== selectedPlace.type_en && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                        {selectedPlace.type_it}
                      </span>
                    )}
                  </p>
                  
                  {selectedPlace.photo ? (
                    <div className="bg-gray-200 h-48 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={selectedPlace.photo} 
                        alt={selectedPlace.name_en}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f1f1f1"/%3E%3Ctext x="50%" y="50%" font-family="Arial" font-size="18" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-[#1f2937] mb-1">Location</h4>
                    <p className="text-sm text-[#6b7280] flex items-start">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-[#22c55e]" />
                      {typeof selectedPlace.coordinates === 'string' 
                        ? selectedPlace.coordinates
                        : `${selectedPlace.coordinates?.lat}, ${selectedPlace.coordinates?.lng}`
                      }
                    </p>
                  </div>
                  
                  {selectedPlace.description_en && (
                    <div className="mb-4">
                      <h4 className="font-medium text-[#1f2937] mb-1">Description</h4>
                      <p className="text-sm text-[#6b7280]">{selectedPlace.description_en}</p>
                      
                      {selectedPlace.description_it && selectedPlace.description_it !== selectedPlace.description_en && (
                        <details className="mt-2">
                          <summary className="text-xs text-[#22c55e] cursor-pointer">Show Italian description</summary>
                          <p className="text-sm text-[#6b7280] mt-1 italic">{selectedPlace.description_it}</p>
                        </details>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2 mt-6">
                    {isRoutingPanelOpen ? (
                      <div>
                        <button 
                          className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors flex items-center justify-center"
                          onClick={() => {
                            // Add this POI as a waypoint
                            if (currentWaypointIndex < waypoints.length) {
                              selectPoiAsWaypoint(selectedPlace);
                            } else {
                              // Add as a new waypoint
                              const newWaypoints = [...waypoints, selectedPlace];
                              setWaypoints(newWaypoints);
                              
                              // Calculate route if we have origin and destination
                              if (newWaypoints.length >= 2 && !newWaypoints.includes(null)) {
                                setRouteSelectionStep(2);
                                fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
                              }
                            }
                            
                            // Close the details view
                            setSelectedPlace(null);
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          {currentWaypointIndex === 0 ? "Set as Starting Point" : 
                           currentWaypointIndex === 1 && waypoints.length === 2 ? "Set as Destination" :
                           `Add to Route`}
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors flex items-center justify-center"
                        onClick={() => {
                          setIsRoutingPanelOpen(true);
                          clearRoute();
                          setWaypoints([selectedPlace, null]);
                          setCurrentWaypointIndex(1);
                          setRouteSelectionStep(1);
                          setError("Now select your destination");
                        }}
                      >
                        <Route className="h-4 w-4 mr-2" />
                        Plan a Route From Here
                      </button>
                    )}
                    
                    <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                      Save to Favorites
                    </button>
                    {selectedPlace.category === 'business' && (
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Add routing helper if in routing mode */}
                  {isRoutingPanelOpen && (
                    <div className="p-4 bg-blue-50">
                      <h3 className="font-medium text-blue-800 mb-2">Route Selection</h3>
                      <p className="text-sm text-blue-600 mb-2">
                        Select points from the list below to add to your route.
                      </p>
                      <p className="text-xs text-blue-500">
                        Currently selecting: {currentWaypointIndex === 0 ? "Starting Point" : 
                                             currentWaypointIndex === waypoints.length - 1 ? "Destination" : 
                                             `Waypoint ${currentWaypointIndex}`}
                      </p>
                    </div>
                  )}
                  
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map(poi => (
                      <div 
                        key={poi._id} 
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (isRoutingPanelOpen) {
                            // In routing mode, add the POI as a waypoint
                            selectPoiAsWaypoint(poi);
                            
                            // If we've now completed the route (have origin and destination)
                            if (currentWaypointIndex === 1 && waypoints[0]) {
                              const newWaypoints = [...waypoints];
                              newWaypoints[1] = poi;
                              fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
                              setRouteSelectionStep(2);
                            }
                          } else {
                            // Normal POI selection behavior
                            setSelectedPlace(poi);
                            centerMapOnPoi(poi);
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className="h-16 w-16 rounded-lg flex-shrink-0 overflow-hidden">
                            {poi.photo ? (
                              <img 
                                src={poi.photo} 
                                alt={poi.name_en}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.className = "hidden";
                                  e.target.parentNode.innerHTML = '<div class="h-full w-full bg-gray-200 flex items-center justify-center"><svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-[#22c55e]" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-[#1f2937]">{poi.name_en}</h3>
                            <p className="text-sm text-[#6b7280] capitalize">
                              {poi.category ? poi.category.replace('_', ' ') : poi.type_en}
                            </p>
                            <p className="text-xs text-[#6b7280] mt-1 truncate max-w-[200px]">
                              {poi.description_en ? poi.description_en.substring(0, 60) + (poi.description_en.length > 60 ? '...' : '') : 'No description available'}
                            </p>
                          
                          {/* Add quick action buttons in routing mode */}
                        {isRoutingPanelOpen && (
                          <div className="flex space-x-2 mt-2">
                            <button 
                              className="text-xs py-1 px-2 rounded bg-green-100 text-green-700 hover:bg-green-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                
                                // Set as starting point
                                const newWaypoints = [...waypoints];
                                newWaypoints[0] = poi;
                                setWaypoints(newWaypoints);
                                
                                if (newWaypoints[newWaypoints.length - 1]) {
                                  setRouteSelectionStep(2);
                                  fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
                                } else {
                                  setCurrentWaypointIndex(1);
                                  setError("Now select your destination");
                                }
                              }}
                            >
                              Start
                            </button>
                            
                            <button 
                              className="text-xs py-1 px-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                                              
                                // Set as destination
                                const newWaypoints = [...waypoints];
                                newWaypoints[newWaypoints.length - 1] = poi;
                                setWaypoints(newWaypoints);
                                                              
                                if (newWaypoints[0]) {
                                  setRouteSelectionStep(2);
                                  fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
                                } else {
                                  setCurrentWaypointIndex(0);
                                  setError("First select your starting point");
                                }
                              }}
                              >
                                End
                              </button>
                                                          
                              {waypoints.length >= 2 && waypoints[0] && waypoints[waypoints.length - 1] && (
                                <button 
                                  className="text-xs py-1 px-2 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                                                  
                                    // Add as waypoint in the middle
                                    const newWaypoints = [...waypoints];
                                    // Insert before the last element
                                    newWaypoints.splice(newWaypoints.length - 1, 0, poi);
                                    setWaypoints(newWaypoints);
                                                                  
                                    // Recalculate route
                                    fetchMultiPointRoute(newWaypoints, routeMode, routePreference);
                                  }}
                                >
                                  Via
                                </button>
                              )}
                              </div>
                              )}
                              </div>
                              </div>
                              </div>
                              ))
                              ) : (
                              <div className="p-8 text-center text-[#6b7280]">
                              {searchQuery ? (
                                <p>No places found matching "{searchQuery}"</p>
                              ) : (
                                <p>No points of interest available</p>
                              )}
                              </div>
                              )}
                              </div>
                              )}
                              </div>
                              )}
                              </div>

                              {/* Bike Routes Panel */}
{isBikeRoutesPanelOpen && (
  <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
    <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
      <h2 className="font-bold text-lg text-[#1f2937]">Bike Routes</h2>
      <button 
        onClick={() => setIsBikeRoutesPanelOpen(false)}
        className="p-1 rounded-full hover:bg-gray-100"
      >
        <X className="h-5 w-5 text-[#6b7280]" />
      </button>
    </div>
    
    <div className="p-4 border-b">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search bike routes..."
          value={bikeRouteSearchQuery || ''}
          onChange={(e) => setBikeRouteSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
      </div>
    </div>
    
    {isBikeRoutesLoading ? (
      <div className="p-8 text-center">
        <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading bike routes...</p>
      </div>
    ) : (
      <div className="divide-y">
        {filteredBikeRoutes.length > 0 ? (
          filteredBikeRoutes.map(route => (
            <div 
              key={route._id} 
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedBikeRoute && selectedBikeRoute._id === route._id ? 'bg-green-50 border-l-4 border-green-500' : ''
              }`}
              onClick={() => downloadGpxFile(route._id)}
            >
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full flex-shrink-0 bg-[#22c55e] bg-opacity-10 flex items-center justify-center">
                  <Bike className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div className="ml-3 flex-1">
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
                    <span>{route.distance} km</span>
                    <span className="mx-2">•</span>
                    <span>{route.estimatedTime} min</span>
                  </div>
                  {route.tags && route.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {route.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {route.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{route.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadGpxFile(route._id);
                    }}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                    title="Load this route"
                  >
                    <Route className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-[#6b7280]">
            {bikeRouteSearchQuery ? (
              <p>No routes found matching "{bikeRouteSearchQuery}"</p>
            ) : (
              <p>No bike routes available</p>
            )}
            <div className="mt-4">
              <Link
                to="/admin/bike-routes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#22c55e] hover:bg-[#16a34a]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Route
              </Link>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}


                              
                              {/* Click anywhere button when in map click mode */}
                              {isRoutingPanelOpen && mapClickEnabled && routeSelectionStep < 2 && (
                              <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-20 flex items-center">
                                <span className="text-sm font-medium text-gray-600 mr-2">
                                  {currentWaypointIndex === 0 ? "Click anywhere on map to set starting point" : "Click anywhere on map to set destination"}
                                </span>
                                <button
                                  onClick={() => setMapClickEnabled(false)}
                                  className="p-1 ml-2 rounded-full hover:bg-gray-100"
                                >
                                  <X className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>
                              )}
                             
                              
                              <style jsx>{`
                                .marker {
                                  background-size: contain;
                                  background-repeat: no-repeat;
                                  cursor: pointer;
                                  width: 60px;
                                  height: 60px;
                                  transition: transform 0.2s ease;
                                }
                                
                                .marker:hover {
                                  transform: scale(1.1);
                                }
                                
                                .waypoint-marker {
                                  cursor: pointer;
                                  transition: transform 0.2s ease;
                                }
                                
                                .waypoint-marker:hover {
                                  transform: scale(1.1);
                                }
                                
                                .mapboxgl-popup-content {
                                  padding: 10px;
                                  border-radius: 6px;
                                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                }
                                
                                .hover-popup .mapboxgl-popup-content {
                                  padding: 12px;
                                  max-width: 300px;
                                  border-left: 4px solid #22c55e;
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
                                
                                .hover-popup-content h3 {
                                  margin: 0 0 2px 0;
                                  font-size: 16px;
                                  color: #1f2937;
                                }
                                
                                .line-clamp-2 {
                                  display: -webkit-box;
                                  -webkit-line-clamp: 2;
                                  -webkit-box-orient: vertical;
                                  overflow: hidden;
                                }
                                
                                @keyframes pulse {
                                  0% {
                                    transform: translate(-50%, -50%) scale(1);
                                    opacity: 0.5;
                                  }
                                  70% {
                                    transform: translate(-50%, -50%) scale(1.3);
                                    opacity: 0.2;
                                  }
                                  100% {
                                    transform: translate(-50%, -50%) scale(1);
                                    opacity: 0.5;
                                  }
                                }
                              `}</style>  
  </div>
)};

export default MapPage;
