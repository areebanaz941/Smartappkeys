import React, { useState, useEffect, useRef } from 'react';
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
  EyeOff,
  Eye,
  Filter,
  Compass,
  ChevronDown,
  ChevronUp,
  Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import TurnByTurnNavigation from './TurnByTurnNavigation';

// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibTJvdGVjaCIsImEiOiJjbTczbzU4aWQwMWdmMmpzY3N4ejJ3czlnIn0.fLDR4uG8kD8-g_IDM8ZPdQ';

const IntegratedMap = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  
  // Sidebar control
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState('pois'); // 'pois', 'routes', 'planner'
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isGpxLoading, setIsGpxLoading] = useState(false);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // POI data and filters
  const [pois, setPois] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [poiCategoryFilter, setPoiCategoryFilter] = useState('all');
  const [visiblePois, setVisiblePois] = useState(new Set());
  
  // GPX route data and filters
  const [bikeRoutes, setBikeRoutes] = useState([]);
  const [bikeRouteSearchQuery, setBikeRouteSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState('all');
  const [selectedBikeRoute, setSelectedBikeRoute] = useState(null);
  const [visibleRoutes, setVisibleRoutes] = useState(new Set());
  
  // Route planning
  const [isRoutingPanelOpen, setIsRoutingPanelOpen] = useState(false);
  const [routeMode, setRouteMode] = useState('walking'); // 'walking' or 'cycling'
  const [routePreference, setRoutePreference] = useState('shortest'); // 'shortest' or 'fastest'
  const [waypoints, setWaypoints] = useState([]);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [routeSelectionStep, setRouteSelectionStep] = useState(0); // 0: none, 1: selecting waypoints, 2: route calculated
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeAlternatives, setRouteAlternatives] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [mapClickEnabled, setMapClickEnabled] = useState(false);
  
  // Map layers visibility control
  const [showPois, setShowPois] = useState(true);
  const [showBikeRoutes, setShowBikeRoutes] = useState(true);
  
  // Collection of refs for cleanup
  const markersRef = useRef([]);
  const poiMarkersRef = useRef({});
  const waypointMarkersRef = useRef([]);
  const hoverPopupRef = useRef(null);
  const routeLayerIds = useRef(new Set());
  const routeSourceIds = useRef(new Set());
  
  // Color maps
  const routeColors = {
    'easy': '#22c55e',      // Green
    'medium': '#f59e0b',    // Amber
    'hard': '#ef4444',      // Red
    'default': '#3b82f6'    // Blue
  };
  
  const routeModeColors = {
    'walking': '#22c55e',   // Green
    'cycling': '#3b82f6'    // Blue
  };
  
  // Track click time for double-click detection
  const lastClickTime = useRef(0);
  const clickTimeout = useRef(null);
  
  // Fetch POIs from API
  useEffect(() => {
    const fetchPois = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/pois');
        
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
  
  // Fetch bike routes from API
  useEffect(() => {
    const fetchBikeRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/bike-routes');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch bike routes');
        }
        
        setBikeRoutes(data.data || []);
        console.log('Bike routes loaded:', data.data?.length || 0);
      } catch (err) {
        console.error('Error fetching bike routes:', err);
        setError(`Failed to load bike routes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBikeRoutes();
  }, []);
  
  // Initialize Mapbox GL map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Default center (San Lorenzo Nuovo)
    const defaultCenter = [11.907, 42.685]; // [lng, lat] for Mapbox GL
    
    try {
      // Create map instance
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/outdoors-v11', // Outdoors style good for both POIs and routes
        center: defaultCenter,
        zoom: 13
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
        console.log('Map loaded successfully');
        setMap(mapInstance);
      });
      
      return () => {
        // Clean up map on unmount
        if (mapInstance) {
          // Clean up markers
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          
          Object.values(poiMarkersRef.current).forEach(marker => {
            if (marker) marker.remove();
          });
          
          waypointMarkersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
          }
          
          // Clean up layers and sources
          routeLayerIds.current.forEach(id => {
            if (mapInstance.getLayer(id)) {
              mapInstance.removeLayer(id);
            }
          });
          
          routeSourceIds.current.forEach(id => {
            if (mapInstance.getSource(id)) {
              mapInstance.removeSource(id);
            }
          });
          
          // Clean up routing data
          if (mapInstance.getLayer('route')) {
            mapInstance.removeLayer('route');
          }
          if (mapInstance.getSource('route')) {
            mapInstance.removeSource('route');
          }
          
          // Remove map instance
          mapInstance.remove();
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Failed to initialize map: ${error.message}`);
    }
  }, []);
  
  // Add POI markers to map when map is ready and POIs are loaded
  useEffect(() => {
    if (!map || !pois.length) return;
    
    console.log('Adding POI markers to map');
    
    // Clear existing POI markers
    Object.values(poiMarkersRef.current).forEach(marker => {
      if (marker) marker.remove();
    });
    poiMarkersRef.current = {};
    
    // Add markers for each POI
    pois.forEach(poi => {
      addPoiMarker(poi);
    });
    
    // Initially set all POIs as visible
    setVisiblePois(new Set(pois.map(poi => poi._id)));
    
  }, [map, pois]);
  
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
  
  // Add a POI marker to the map
  const addPoiMarker = (poi) => {
    if (!map) return null;
    
    // Parse coordinates
    const coords = getMapboxCoords(poi);
    if (!coords) {
      console.warn(`Invalid coordinates for POI: ${poi.name_en}`);
      return null;
    }
    
    // Create custom HTML element for marker
    const el = document.createElement('div');
    el.className = 'poi-marker marker';
    el.style.backgroundImage = `url('/pointer.png')`;
    el.style.width = '66px';
    el.style.height = '66px';
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
    
    // Create marker with specific options to keep it fixed
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom', // Anchor point at the bottom of the marker
      pitchAlignment: 'map', // Align with map's pitch
      rotationAlignment: 'map' // Align with map's rotation
    })
    .setLngLat(coords)
    .setPopup(popup)
    .addTo(map);
    
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
      .setLngLat(coords)
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
      
      hoverPopup.addTo(map);
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
      
      // If the time difference is less than 300ms, it's a double-click
      if (timeDiff < 300) {
        // Double-click - deselect
        if (!isRoutingPanelOpen) {
          setSelectedPlace(null);
        }
        
        // If there's a hover popup, remove it
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        }

        // Remove any popups
        marker.getPopup().remove();
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
            setActiveSidebarTab('pois');
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
    
    // Store the marker reference
    poiMarkersRef.current[poi._id] = marker;
  
  return marker;
  };
  
  // Update POI markers visibility based on filters
  useEffect(() => {
    if (!map) return;
    
    const filteredPois = filterPois();
    
    // Get set of filtered POI IDs
    const filteredPoiIds = new Set(filteredPois.map(poi => poi._id));
    
    // Update markers visibility
    Object.entries(poiMarkersRef.current).forEach(([poiId, marker]) => {
      if (!marker) return;
      
      const shouldBeVisible = filteredPoiIds.has(poiId) && showPois;
      
      // Get marker element
      const el = marker.getElement();
      
      if (shouldBeVisible) {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    });
    
  }, [map, searchQuery, poiCategoryFilter, showPois]);
  
  // Filter POIs based on search and category
  const filterPois = () => {
    if (!pois.length) return [];
    
    return pois.filter(poi => {
      // Apply search filter
      const matchesSearch = !searchQuery || 
        poi.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.name_it?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.type_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.type_it?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.description_en?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply category filter
      const matchesCategory = poiCategoryFilter === 'all' || 
        poi.category === poiCategoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  // Filter bike routes based on search and filters
  const filterBikeRoutes = () => {
    if (!bikeRoutes.length) return [];
    
    return bikeRoutes.filter(route => {
      // Apply search filter
      const matchesSearch = !bikeRouteSearchQuery || 
        route.name?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase()) ||
        route.roadType?.toLowerCase().includes(bikeRouteSearchQuery.toLowerCase());
      
      // Apply difficulty filter
      const matchesDifficulty = difficultyFilter === 'all' || 
        route.difficulty === difficultyFilter;
      
      // Apply road type filter
      const matchesRoadType = roadTypeFilter === 'all' || 
        route.roadType === roadTypeFilter;
      
      return matchesSearch && matchesDifficulty && matchesRoadType;
    });
  };
  
  // Function to fetch and display a GPX track
  const fetchAndDisplayGpx = async (routeId) => {
    if (!map || !routeId) return;
    
    try {
      setIsGpxLoading(true);
      setError(null);
      
      // Fetch route details first
      const routeResponse = await fetch(`http://localhost:5000/api/bike-routes/${routeId}`);
      
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
        const pathResponse = await fetch(`http://localhost:5000/api/bike-routes/${routeId}/path`);
        
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
      setSelectedBikeRoute(route);
      
      // Switch to routes tab
      setActiveSidebarTab('routes');
      setIsSidebarOpen(true);
      
    } catch (err) {
      console.error('Error fetching GPX data:', err);
      setError(`Failed to load route: ${err.message}`);
    } finally {
      setIsGpxLoading(false);
    }
  };
  
  // Display route directly from path data
  const displayRouteFromPath = (route) => {
    if (!map || !route.path || route.path.length === 0 || !showBikeRoutes) return;
    
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
    if (!map || !geoJson || !geoJson.geometry || !geoJson.geometry.coordinates || !showBikeRoutes) return;
    
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
      routeSourceIds.current.add(sourceId);
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
          'line-width': 4,
          'line-opacity': 0.75
        }
      });
      
      // Track the layer for cleanup
      routeLayerIds.current.add(layerId);
      
      // Add hover effect
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty(layerId, 'line-width', 6);
      });
      
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        map.setPaintProperty(layerId, 'line-width', 4);
      });
      
      // Add click handler
      map.on('click', layerId, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
        if (features.length > 0) {
          const clickedRouteId = features[0].properties.id;
          const clickedRoute = bikeRoutes.find(r => r._id === clickedRouteId);
          if (clickedRoute) {
            setSelectedBikeRoute(clickedRoute);
            setActiveSidebarTab('routes');
            setIsSidebarOpen(true);
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
      el.className = 'route-marker marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = isStart ? '#22c55e' : '#3b82f6';
      el.style.border = '2px solid white';
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
  
  // Update bike routes visibility based on filters
  useEffect(() => {
    if (!map) return;
    
    const filteredRoutes = filterBikeRoutes();
    
    // Get set of filtered route IDs
    const filteredRouteIds = new Set(filteredRoutes.map(route => route._id));
    
    // Update route layers visibility
    routeLayerIds.current.forEach(layerId => {
      const routeId = layerId.replace('route-layer-', '');
      
      if (map.getLayer(layerId)) {
        const shouldBeVisible = filteredRouteIds.has(routeId) && showBikeRoutes;
        map.setLayoutProperty(
          layerId, 
          'visibility', 
          shouldBeVisible ? 'visible' : 'none'
        );
      }
    });
    
    // Update visible routes set
    setVisibleRoutes(prev => {
      const newSet = new Set();
      prev.forEach(routeId => {
        if (filteredRouteIds.has(routeId) && showBikeRoutes) {
          newSet.add(routeId);
        }
      });
      return newSet;
    });
    
  }, [map, bikeRouteSearchQuery, difficultyFilter, roadTypeFilter, showBikeRoutes]);
  
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
      routeLayerIds.current.delete(layerId);
    }
    
    // Remove source if it exists
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
      routeSourceIds.current.delete(sourceId);
    }
    
    // Remove from visible routes
    setVisibleRoutes(prev => {
      const newSet = new Set(prev);
      newSet.delete(routeId);
      return newSet;
    });
    
    // Clear selected route if it's the one being removed
    if (selectedBikeRoute && selectedBikeRoute._id === routeId) {
      setSelectedBikeRoute(null);
    }
    
    // Remove associated markers (this is a simplified approach)
    markersRef.current = markersRef.current.filter(marker => {
      marker.remove();
      return false;
    });
  };
  
  // Show all routes or clear all routes
  const toggleAllRoutes = (showAll) => {
    if (showAll) {
      // Show all filtered routes
      const filteredRoutes = filterBikeRoutes();
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
        <h3 class="font-bold">${point.name_en || 'Custom Point'}</h3>
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
      if (point) { // Only add markers for defined waypoints
        addWaypointMarker(point, index);
      }
    });
  };
  
  // Update markers when waypoints change
  useEffect(() => {
    renderWaypointMarkers();
  }, [waypoints, map]);
  
  // Helper function to create a custom point object from map coordinates
  const createCustomPoint = (lngLat, index) => {
    const id = `custom-${Date.now()}-${index}`;
    return {
      _id: id,
      name_en: index === 0 ? 'Starting Point' : (index === waypoints.length - 1 ? 'Destination' : `Waypoint ${index}`),
      type_en: 'Custom Location',
      coordinates: {
        lng: lngLat.lng,
        lat: lngLat.lat
      },
      custom: true
    };
  };
  
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
    if (!points || points.length < 2 || points.some(p => !p)) return;
    
    try {
      setIsRoutingLoading(true);
      setRouteAlternatives([]);
      setError(null);
      
      // Convert all waypoints to coordinates strings
      const coordinatesStrings = points.map(point => {
        const coords = getMapboxCoords(point);
        if (!coords) throw new Error(`Invalid coordinates for waypoint: ${point.name_en || 'Unknown'}`);
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
        displayRoutePlan(primaryRoute, points, mode);
        setSelectedRouteIndex(0);
      } else {
        // Single route
        const route = data.routes[0];
        displayRoutePlan(route, points, mode);
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
  
  // Display a route plan on the map
  const displayRoutePlan = (route, routeWaypoints, mode) => {
    if (!map) return;
    
    // Clear previous route
    clearRoutePlan();
    
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
          'line-color': routeModeColors[mode] || routeModeColors.walking,
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    } else {
      map.setPaintProperty('route', 'line-color', routeModeColors[mode] || routeModeColors.walking);
    }
    
    // Fit map to show the entire route
    const coordinates = route.geometry.coordinates;
    
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    
    map.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: isSidebarOpen ? 350 : 50, right: 50 }
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
  
  // Clear route plan display from map
  const clearRoutePlan = () => {
    if (!map) return;
    
    // Remove route layer and source
    if (map.getLayer('route')) {
      map.removeLayer('route');
    }
    if (map.getSource('route')) {
      map.removeSource('route');
    }
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
              name: waypoint.name_en || `Waypoint ${index + 1}`,
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
    
    displayRoutePlan(route, waypoints, routeMode);
  };
  
  // Toggle between walking and cycling modes
  const toggleRouteMode = () => {
    const newMode = routeMode === 'walking' ? 'cycling' : 'walking';
    setRouteMode(newMode);
    
    // If there's already a selected route, update it
    if (waypoints.length >= 2 && !waypoints.includes(null)) {
      fetchMultiPointRoute(waypoints, newMode, routePreference);
    }
  };
  
  // Toggle between shortest and fastest routes
  const toggleRoutePreference = () => {
    const newPreference = routePreference === 'shortest' ? 'fastest' : 'shortest';
    setRoutePreference(newPreference);
    
    // If there's already a selected route, update it
    if (waypoints.length >= 2 && !waypoints.includes(null)) {
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
    setMapClickEnabled(true);
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
  
  // Start route planning mode
  const startRoutePlanning = () => {
    setIsRoutingPanelOpen(true);
    clearRoutePlan();
    clearWaypointMarkers();
    setRouteSelectionStep(0);
    setWaypoints([null, null]); // Initial setup for origin and destination
    setCurrentWaypointIndex(0);
    setMapClickEnabled(true);
    setError("Select your starting point");
    setActiveSidebarTab('planner');
  };
  
  // Clear route planning
  const clearRoutePlanning = () => {
    clearRoutePlan();
    clearWaypointMarkers();
    setRouteInfo(null);
    setWaypoints([]);
    setCurrentWaypointIndex(0);
    setRouteAlternatives([]);
    setSelectedRouteIndex(0);
    setRouteSelectionStep(0);
    setMapClickEnabled(false);
    setError(null);
  };
  
  // Handle direct map clicks (not on POI markers or routes)
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
  
  // Format distance (meters to kilometers)
  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return (meters / 1000).toFixed(1) + ' km';
  };
  
  // Format duration (seconds to human-readable)
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
  
  // Format elevation (meters)
  const formatElevation = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return Math.round(meters) + ' m';
  };
  
  // Get POI categories for filter
  const getPoiCategories = () => {
    const categories = new Set();
    pois.forEach(poi => {
      if (poi.category) {
        categories.add(poi.category);
      }
    });
    return Array.from(categories);
  };
  
  // Get road types for filter
  const getRoadTypes = () => {
    const types = new Set();
    bikeRoutes.forEach(route => {
      if (route.roadType) {
        types.add(route.roadType);
      }
    });
    return Array.from(types);
  };

  return (
    <div className="h-screen w-full bg-white relative flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="San Lorenzo Nuovo Logo" 
            className="h-16 w-auto mr-3" 
          />
          <span className="font-bold text-lg text-[#22c55e]">San Lorenzo Nuovo Explorer</span>
        </Link>
      </div>
      
      <div className="relative w-full max-w-md mx-4">
        <input
          type="text"
          placeholder="Search places and routes..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setBikeRouteSearchQuery(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6b7280]" />
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          className={`p-2 rounded-full hover:bg-gray-100 relative ${activeSidebarTab === 'planner' ? 'bg-gray-100' : ''}`}
          onClick={startRoutePlanning}
          title="Route Planner"
        >
          <Route className="h-5 w-5 text-[#6b7280]" />
        </button>
        <button 
          className={`p-2 rounded-full hover:bg-gray-100 ${showPois ? 'text-green-600' : 'text-gray-400'}`}
          onClick={() => setShowPois(!showPois)}
          title={showPois ? "Hide POIs" : "Show POIs"}
        >
          <MapPin className="h-5 w-5" />
        </button>
        <button 
          className={`p-2 rounded-full hover:bg-gray-100 ${showBikeRoutes ? 'text-blue-600' : 'text-gray-400'}`}
          onClick={() => setShowBikeRoutes(!showBikeRoutes)}
          title={showBikeRoutes ? "Hide Bike Routes" : "Show Bike Routes"}
        >
          <Bike className="h-5 w-5" />
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
              <p className="mt-2 text-gray-600">Loading map data...</p>
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
        
        {/* Routing loading indicator */}
        {isRoutingLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-20">
            <div className="text-center bg-white p-4 rounded-lg shadow-md">
              <div className="w-10 h-10 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto"></div>
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
        
        {/* Map container */}
        <div ref={mapContainer} className="w-full h-full z-0"></div>
        
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="absolute top-0 left-0 h-full w-80 bg-white shadow-lg z-10 overflow-hidden flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b">
              <button 
                className={`flex-1 py-3 font-medium text-sm ${activeSidebarTab === 'pois' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveSidebarTab('pois')}
              >
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  POIs
                </div>
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-sm ${activeSidebarTab === 'routes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveSidebarTab('routes')}
              >
                <div className="flex items-center justify-center">
                  <Bike className="h-4 w-4 mr-1" />
                  Bike Routes
                </div>
              </button>
              <button 
                className={`flex-1 py-3 font-medium text-sm ${activeSidebarTab === 'planner' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => {
                  setActiveSidebarTab('planner');
                  if (!isRoutingPanelOpen) {
                    startRoutePlanning();
                  }
                }}
              >
                <div className="flex items-center justify-center">
                  <Route className="h-4 w-4 mr-1" />
                  Planner
                </div>
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* POIs Tab */}
              {activeSidebarTab === 'pois' && (
                <div>
                  {/* POI Filters */}
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-[#1f2937] mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      POI Filters
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={poiCategoryFilter}
                          onChange={(e) => setPoiCategoryFilter(e.target.value)}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="all">All categories</option>
                          {getPoiCategories().map(category => (
                            <option key={category} value={category}>
                              {category.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Show on Map</label>
                        <button
                          onClick={() => setShowPois(!showPois)}
                          className={`w-full py-2 px-3 rounded-md flex items-center justify-center text-sm ${
                            showPois ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {showPois ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              POIs Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              POIs Hidden
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* POI List */}
                  <div className="divide-y">
                    {selectedPlace ? (
                      // POI Detail View
                      <div className="p-4">
                        <div className="mb-4">
                          <button 
                            onClick={() => setSelectedPlace(null)}
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
                          <button 
                            className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors flex items-center justify-center"
                            onClick={() => {
                              setActiveSidebarTab('planner');
                              setIsRoutingPanelOpen(true);
                              clearRoutePlanning();
                              setWaypoints([selectedPlace, null]);
                              setCurrentWaypointIndex(1);
                              setRouteSelectionStep(1);
                              setMapClickEnabled(true);
                              setError("Now select your destination");
                            }}
                          >
                            <Route className="h-4 w-4 mr-2" />
                            Plan a Route From Here
                          </button>
                        </div>
                      </div>
                    ) : (
                      // POI List View
                      <>
                        {filterPois().length > 0 ? (
                          filterPois().map(poi => (
                            <div 
                              key={poi._id} 
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedPlace(poi);
                                // Center map on POI
                                const coords = getMapboxCoords(poi);
                                if (coords && map) {
                                  map.flyTo({
                                    center: coords,
                                    zoom: 15,
                                    essential: true
                                  });
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
                                  
                                  {/* Quick action buttons */}
                                  <div className="flex space-x-2 mt-2">
                                    <button 
                                      className="text-xs py-1 px-2 rounded bg-green-100 text-green-700 hover:bg-green-200"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSidebarTab('planner');
                                        setIsRoutingPanelOpen(true);
                                        clearRoutePlanning();
                                        setWaypoints([poi, null]);
                                        setCurrentWaypointIndex(1);
                                        setRouteSelectionStep(1);
                                        setMapClickEnabled(true);
                                        setError("Now select your destination");
                                      }}
                                    >
                                      Start Route
                                    </button>
                                  </div>
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
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Bike Routes Tab */}
              {activeSidebarTab === 'routes' && (
                <div>
                  {/* Route Filters */}
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-[#1f2937] mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-1" />
                      Route Filters
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
                          {getRoadTypes().map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="pt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Show on Map</label>
                        <button
                          onClick={() => setShowBikeRoutes(!showBikeRoutes)}
                          className={`w-full py-2 px-3 rounded-md flex items-center justify-center text-sm ${
                            showBikeRoutes ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {showBikeRoutes ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Routes Visible
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Routes Hidden
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => toggleAllRoutes(true)}
                          className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-md text-sm hover:bg-blue-200 flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Show All
                        </button>
                        <button
                          onClick={() => toggleAllRoutes(false)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center"
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Routes List */}
                  <div className="divide-y">
                    {selectedBikeRoute ? (
                      // Bike Route Detail View
                      <div className="p-4">
                        <div className="mb-4">
                          <button 
                            onClick={() => setSelectedBikeRoute(null)}
                            className="text-[#3b82f6] flex items-center text-sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to routes
                          </button>
                        </div>
                        
                        <h3 className="font-bold text-xl text-[#1f2937] mb-2">{selectedBikeRoute.name}</h3>
                        
                        <div className="flex items-center mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                            selectedBikeRoute.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            selectedBikeRoute.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedBikeRoute.difficulty.charAt(0).toUpperCase() + selectedBikeRoute.difficulty.slice(1)}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="text-sm text-gray-600 capitalize">{selectedBikeRoute.roadType || 'Mixed'}</span>
                        </div>
                        
                        {selectedBikeRoute.description && (
                          <p className="text-sm text-gray-600 mb-4">{selectedBikeRoute.description}</p>
                        )}
                        
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-gray-500 text-xs mb-1">Distance</div>
                            <div className="font-semibold text-gray-900">
                              {formatDistance(selectedBikeRoute.stats?.totalDistance * 1000 || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-gray-500 text-xs mb-1">Elevation Gain</div>
                            <div className="font-semibold text-gray-900">
                              {formatElevation(selectedBikeRoute.stats?.elevationGain || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-gray-500 text-xs mb-1">Max Elevation</div>
                            <div className="font-semibold text-gray-900">
                              {formatElevation(selectedBikeRoute.stats?.maxElevation || 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="text-gray-500 text-xs mb-1">Min Elevation</div>
                            <div className="font-semibold text-gray-900">
                              {formatElevation(selectedBikeRoute.stats?.minElevation || 0)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex space-x-2 mt-4">
                          <a 
                            href={`http://localhost:5000/api/bike-routes/${selectedBikeRoute._id}/gpx`}
                            download={`${selectedBikeRoute.name}.gpx`}
                            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download GPX
                          </a>
                          <button 
                            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => {
                              // Get the first and last points from the path
                              if (selectedBikeRoute.path && selectedBikeRoute.path.length >= 2) {
                                const startPoint = selectedBikeRoute.path[0];
                                const endPoint = selectedBikeRoute.path[selectedBikeRoute.path.length - 1];
                                
                                // Create POI-like objects
                                const startPoi = {
                                  _id: `start-${selectedBikeRoute._id}`,
                                  name_en: `Start of ${selectedBikeRoute.name}`,
                                  type_en: 'Starting Point',
                                  coordinates: {
                                    lng: startPoint[0],
                                    lat: startPoint[1]
                                  },
                                  custom: true
                                };
                                
                                const endPoi = {
                                  _id: `end-${selectedBikeRoute._id}`,
                                  name_en: `End of ${selectedBikeRoute.name}`,
                                  type_en: 'End Point',
                                  coordinates: {
                                    lng: endPoint[0],
                                    lat: endPoint[1]
                                  },
                                  custom: true
                                };
                                
                                // Switch to planner tab and set up route
                                setActiveSidebarTab('planner');
                                setIsRoutingPanelOpen(true);
                                clearRoutePlanning();
                                setWaypoints([startPoi, endPoi]);
                                setRouteSelectionStep(2);
                                setRouteMode('cycling');
                                fetchMultiPointRoute([startPoi, endPoi], 'cycling', routePreference);
                              }
                            }}
                          >
                            <Route className="h-4 w-4 mr-2" />
                            Navigate This Route
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Bike Routes List View
                      <>
                        {filterBikeRoutes().length > 0 ? (
                          filterBikeRoutes().map(route => (
                            <div 
                              key={route._id} 
                              className={`p-4 hover:bg-gray-50 transition-colors ${
                                visibleRoutes.has(route._id) ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="h-10 w-10 rounded-full flex-shrink-0 bg-opacity-10 flex items-center justify-center mr-2"
                                     style={{ backgroundColor: `${routeColors[route.difficulty] || routeColors.default}20` }}>
                                  <Bike className="h-5 w-5" style={{ color: routeColors[route.difficulty] || routeColors.default }} />
                                </div>
                                <div 
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => {
                                    setSelectedBikeRoute(route);
                                    
                                    // If route is not already visible, display it
                                    if (!visibleRoutes.has(route._id)) {
                                      fetchAndDisplayGpx(route._id);
                                    }
                                    
                                    // If route has path data, fit map to it
                                    if (route.path && route.path.length > 0) {
                                      fitMapToRoute(route.path);
                                    }
                                  }}
                                >
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
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-[#6b7280]">
                            {bikeRouteSearchQuery || difficultyFilter !== 'all' || roadTypeFilter !== 'all' ? (
                              <p>No routes match your filters</p>
                            ) : (
                              <p>No bike routes available</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Route Planner Tab */}
              {activeSidebarTab === 'planner' && (
                <div>
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
                        onClick={() => {
                          setMapClickEnabled(!mapClickEnabled);
                          if (mapClickEnabled) {
                            setError(null);
                          } else {
                            setError("Click on the map to set waypoints");
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 ${
                          mapClickEnabled ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                        } hover:bg-amber-200`}
                      >
                        <CircleDot className="h-4 w-4" />
                        <span>{mapClickEnabled ? "Disable Map Click" : "Enable Map Click"}</span>
                      </button>
                      
                      <button
                        onClick={clearRoutePlanning}
                        className="flex-1 py-2 px-3 rounded-md flex items-center justify-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200"
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
    
    {/* Add waypoint button */}
    {waypoints.length >= 2 && !waypoints.includes(null) && (
      <button
        onClick={addWaypoint}
        className="w-full mt-2 py-2 px-3 rounded-md flex items-center justify-center text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Waypoint
      </button>
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
  <TurnByTurnNavigation steps={routeInfo.steps} map={map} />
)}
                </div>
              )}
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-[#6b7280]" />
            </button>
          </div>
        )}
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
          <h3 className="text-sm font-medium mb-2">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2 bg-[#22c55e]"></div>
              <span className="text-xs">Easy Route</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2 bg-[#f59e0b]"></div>
              <span className="text-xs">Medium Route</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2 bg-[#ef4444]"></div>
              <span className="text-xs">Hard Route</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full mr-2 flex items-center justify-center" style={{ backgroundImage: "url('/pointer.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat" }}></div>
              <span className="text-xs">Points of Interest</span>
            </div>
          </div>
        </div>
        
        {/* Click anywhere button when in map click mode */}
        {mapClickEnabled && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-20 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">
              {currentWaypointIndex === 0 ? "Click anywhere on map to set starting point" : 
               currentWaypointIndex === waypoints.length - 1 ? "Click anywhere on map to set destination" :
               `Click anywhere on map to set waypoint ${currentWaypointIndex}`}
            </span>
            <button
              onClick={() => setMapClickEnabled(false)}
              className="p-1 ml-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .marker:hover {
          transform: scale(1.1);
        }
        
        .poi-marker {
         
          
  transform-origin: bottom center;
  will-change: transform;
        }
        
        .waypoint-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
          z-index: 2;
        }
        
        .waypoint-marker:hover {
          transform: scale(1.1);
        }
        
        .route-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
          z-index: 2;
        }
        
        .route-marker:hover {
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
      `}</style>
    </div>
  );
};

// Helper icon components
const Plus = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const CircleDot = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="1"></circle>
  </svg>
);

export default IntegratedMap;