import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Menu, Map as MapIcon, Image } from 'lucide-react';
import Header from '../pages/header';
import axios from 'axios';

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayersRef = useRef([]);
  const [viewType, setViewType] = useState('map');
  const [routes, setRoutes] = useState([]);
  const [visibleRoutes, setVisibleRoutes] = useState(0);

  useEffect(() => {
    fetchRoutes();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

 const API_URL = 'http://localhost:5000/api';

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`${API_URL}/routes`);
      setRoutes(response.data);
      setVisibleRoutes(response.data.length);
      if (mapInstanceRef.current) {
        displayRoutes(response.data);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

    const stateLocations = [
    { name: 'Colorado', lat: 39.5501, lng: -105.7821 },
    { name: 'Virginia', lat: 37.7304, lng: -79.2037 },
    { name: 'Vermont', lat: 44.5588, lng: -72.5778 }
  ];

  const displayRoutes = async (routes) => {
    clearRouteLayers();
    
    for (const route of routes) {
      try {
        const gpxResponse = await axios.get(`http://localhost:5000/${route.gpxFile.path.replace(/\\/g, '/')}`);
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxResponse.data, "text/xml");
        const tracks = gpxDoc.getElementsByTagName('trk');

        Array.from(tracks).forEach(track => {
          const points = Array.from(track.getElementsByTagName('trkpt')).map(trkpt => [
            parseFloat(trkpt.getAttribute('lat')),
            parseFloat(trkpt.getAttribute('lon'))
          ]);

          // Create route line with style
          const routeLine = L.polyline(points, {
            color: '#FF4500',
            weight: 6,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: null,
            className: 'route-line',
            shadow: true,
            stroke: true,
            fillColor: '#FF4500',
            fillOpacity: 0.8
          }).addTo(mapInstanceRef.current);

          // Add hover effect
          routeLine.on('mouseover', function() {
            this.setStyle({
              weight: 6,
              opacity: 1
            });
          });

          routeLine.on('mouseout', function() {
            this.setStyle({
              weight: 4,
              opacity: 0.8
            });
          });

          // Add click handler for route details
        routeLine.on('click', function() {
            this.bindPopup(`
              <div class="max-w-xs">
                <h3 class="font-semibold text-lg">${route.name}</h3>
                <p class="text-sm mt-1">${route.description}</p>
                ${route.images?.[0] ? `
                  <img src="https://great-roads-2.onrender.com/${route.images[0].thumbnailPath || route.images[0].path}" 
                       class="mt-2 w-full h-32 object-cover rounded"
                       alt="${route.name}"
                       onerror="this.src='fallback-image.jpg'"
                  />
                ` : ''}
              </div>
            `).openPopup();
          });

          // Add start/end markers
          const startMarker = L.marker(points[0], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).addTo(mapInstanceRef.current);

          const endMarker = L.marker(points[points.length - 1], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).addTo(mapInstanceRef.current);

          routeLayersRef.current.push(routeLine, startMarker, endMarker);
        });
      } catch (error) {
        console.error(`Error displaying route ${route._id}:`, error);
      }
    }
  };

  const clearRouteLayers = () => {
    routeLayersRef.current.forEach(layer => {
      mapInstanceRef.current?.removeLayer(layer);
    });
    routeLayersRef.current = [];
  };

  const initializeMap = () => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        zoomControl: false
      });

      const tileLayer = getTileLayer(viewType);
      tileLayer.addTo(map);
      
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      mapInstanceRef.current = map;

      stateLocations.forEach(state => {
        L.marker([state.lat, state.lng], { 
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md"></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        })
        .bindPopup(`<strong class="text-lg">${state.name}</strong>`)
        .addTo(map);
      });

      const bounds = L.latLngBounds(stateLocations.map(state => [state.lat, state.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });

      if (routes.length > 0) {
        displayRoutes(routes);
      }
    }
  };

  const getTileLayer = (type) => {
    return type === 'map' 
      ? L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        })
      : L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '© Esri'
        });
  };

  const handleViewTypeChange = (type) => {
    setViewType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      getTileLayer(type).addTo(mapInstanceRef.current);
    }
  };

  useEffect(() => {
    initializeMap();
  }, [viewType]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="relative flex-grow">
        <div ref={mapRef} className="absolute inset-0" />
        
        {/* Map Controls */}
        <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg z-[1000]">
          <div className="flex border-b">
            <button 
              className={`px-4 py-2 flex items-center space-x-2 rounded-tl-lg transition-colors hover:bg-gray-50 
                ${viewType === 'map' ? 'bg-gray-100' : ''}`}
              onClick={() => handleViewTypeChange('map')}
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>
            <button 
              className={`px-4 py-2 flex items-center space-x-2 rounded-tr-lg transition-colors hover:bg-gray-50
                ${viewType === 'satellite' ? 'bg-gray-100' : ''}`}
              onClick={() => handleViewTypeChange('satellite')}
            >
              <Image className="w-4 h-4" />
              <span>Satellite</span>
            </button>
          </div>
        </div>

        {/* Sidebars Container */}
        <div className="absolute left-4 top-20 flex space-x-4 z-[1000] transition-all duration-300">
          {/* Filters Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-base font-semibold">Filters</h2>
              <span className="text-sm text-gray-500">0 active</span>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-6">
              {/* Area Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Area</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" name="area" className="mr-2" defaultChecked />
                    <span className="text-sm">Map area</span>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" name="area" className="mr-2" />
                    <span className="text-sm">Within</span>
                    <input type="text" className="w-16 mx-2 px-2 py-1 bg-gray-100 rounded" placeholder="any" />
                    <span className="text-sm">miles of</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full mt-2 px-3 py-2 bg-gray-100 rounded"
                    placeholder="ZIP, City, State, Province"
                  />
                </div>
              </div>

              {/* Route Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Route Type</label>
                <div className="space-y-2">
                  {['All', 'Segments', 'Routes'].map((type) => (
                    <div key={type} className="flex items-center">
                      <input 
                        type="radio" 
                        name="routeType" 
                        className="mr-2"
                        defaultChecked={type === 'All'} 
                      />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distance Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Distance</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Between</span>
                  <input type="text" className="w-16 px-2 py-1 bg-gray-100 rounded" placeholder="any" />
                  <span className="text-sm">and</span>
                  <input type="text" className="w-16 px-2 py-1 bg-gray-100 rounded" placeholder="any" />
                  <span className="text-sm">miles</span>
                </div>
              </div>

              {/* Elevation Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Elevation gain</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Between</span>
                  <input type="text" className="w-16 px-2 py-1 bg-gray-100 rounded" placeholder="any" />
                  <span className="text-sm">and</span>
                  <input type="text" className="w-16 px-2 py-1 bg-gray-100 rounded" placeholder="any" />
                  <span className="text-sm">feet</span>
                </div>
              </div>

              {/* Surface Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Surface</label>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Only show fully unpaved routes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Routes Sidebar */}
          <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-base font-semibold">Routes</h2>
              <span className="text-sm text-gray-500">{routes.length} visible</span>
            </div>
            
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {routes.length > 0 ? (
                routes.map(route => (
                  <div 
                    key={route._id}
                    id={`route-${route._id}`}
                    className="p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      const routeLine = routeLayersRef.current.find(
                        layer => layer.options?.routeId === route._id
                      );
                      if (routeLine && mapInstanceRef.current) {
                        const bounds = routeLine.getBounds();
                        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                      }
                    }}
                  >
                    {route.images?.length > 0 && (
                      <div className="mb-3 h-48 overflow-hidden rounded-lg relative">
                        <img 
                          src={`http://localhost:5000/${route.images[0].thumbnailPath || route.images[0].path}`}
                          alt={route.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.src = 'fallback-image.jpg';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          {route.images.length} photos
                        </div>
                      </div>
                    )}
                    <h3 className="font-medium text-base text-gray-900">{route.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{route.description}</p>
                    
                    <div className="mt-2 flex space-x-2 text-xs text-gray-500">
                      <span>{route.distance} mi</span>
                      <span>•</span>
                      <span>{route.elevationProfile?.max || '0'} ft gain</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-800">No routes found</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
