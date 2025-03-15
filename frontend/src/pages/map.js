import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Layers, Info, X, List, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your access token
mapboxgl.accessToken = 'pk.eyJ1IjoibTJvdGVjaCIsImEiOiJjbTczbzU4aWQwMWdmMmpzY3N4ejJ3czlnIn0.fLDR4uG8kD8-g_IDM8ZPdQ';

const MapPage = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [pois, setPois] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  
  // Track click time for double-click detection
  const lastClickTime = useRef(0);
  const clickTimeout = useRef(null);
  
  // Use a ref for markers to avoid dependency issues in cleanup
  const markersRef = useRef([]);
  const hoverPopupRef = useRef(null);
  
  // Fetch POIs from API
  useEffect(() => {
    const fetchPois = async () => {
      try {
        setIsLoading(true);
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
              
              // If the time difference is less than 300ms, it's a double-click
              if (timeDiff < 300) {
                // Double-click - deselect
                setSelectedPlace(null);
                setIsSidebarOpen(false);
                
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
                  setSelectedPlace(poi);
                  setIsSidebarOpen(true);
                  
                  // If there's a hover popup, remove it
                  if (hoverPopupRef.current) {
                    hoverPopupRef.current.remove();
                    hoverPopupRef.current = null;
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
        
        // Don't close sidebar on map click to avoid conflicting with marker clicks
        // Instead, we'll handle closing via the X button or double-click
        
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
  }, [pois, isLoading, map]);
  
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
              <button className="p-2 rounded-full hover:bg-gray-100">
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
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
              <p className="font-medium">Error</p>
              <p>{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* Map container - using ref instead of id */}
        <div ref={mapContainer} className="w-full h-full z-0"></div>
        
        {/* Sidebar */}
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
                  <button className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors">
                    Get Directions
                  </button>
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
                {filteredPlaces.length > 0 ? (
                  filteredPlaces.map(poi => (
                    <div 
                      key={poi._id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedPlace(poi);
                        centerMapOnPoi(poi);
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

export default MapPage;