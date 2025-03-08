import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Layers, Info, X, List, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const MapPage = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Sample places data (would typically come from an API)
  const places = [
    { id: 1, name: 'Eiffel Tower', category: 'Landmark', rating: 4.7, lat: 48.8584, lng: 2.2945 },
    { id: 2, name: 'Louvre Museum', category: 'Museum', rating: 4.8, lat: 48.8606, lng: 2.3376 },
    { id: 3, name: 'Notre-Dame Cathedral', category: 'Historic', rating: 4.6, lat: 48.8530, lng: 2.3499 },
    { id: 4, name: 'Montmartre', category: 'District', rating: 4.5, lat: 48.8867, lng: 2.3431 },
    { id: 5, name: 'Luxembourg Gardens', category: 'Park', rating: 4.7, lat: 48.8462, lng: 2.3372 },
  ];

  // Initialize Leaflet map
  useEffect(() => {
    // Check if leaflet is available (loaded via CDN in index.html)
    if (typeof L !== 'undefined' && !isMapLoaded) {
      // Initialize the map
      const mapInstance = L.map('map').setView([48.8566, 2.3522], 13); // Paris coordinates
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Add markers for each place
      places.forEach(place => {
        const marker = L.marker([place.lat, place.lng])
          .addTo(mapInstance)
          .bindPopup(`<b>${place.name}</b><br>${place.category}`);
          
        marker.on('click', () => {
          setSelectedPlace(place);
          setIsSidebarOpen(true);
        });
      });
      
      setMap(mapInstance);
      setIsMapLoaded(true);
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);
  
  // Filter places based on search query
  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close sidebar when clicking on map (if you click outside the sidebar)
  useEffect(() => {
    if (map && isSidebarOpen) {
      map.on('click', () => {
        setIsSidebarOpen(false);
      });
    }
    
    return () => {
      if (map) {
        map.off('click');
      }
    };
  }, [map, isSidebarOpen]);

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
        {/* Map container */}
        <div id="map" className="w-full h-full z-0"></div>
        
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-lg z-10 overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#1f2937]">Places</h2>
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
                <h3 className="font-bold text-xl text-[#1f2937] mb-2">{selectedPlace.name}</h3>
                <div className="flex items-center text-yellow-500 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-4 w-4 ${i < Math.floor(selectedPlace.rating) ? 'fill-current' : 'stroke-current fill-transparent'}`} viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm text-[#6b7280]">{selectedPlace.rating}</span>
                </div>
                <p className="text-sm text-[#6b7280] mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#22c55e]">
                    {selectedPlace.category}
                  </span>
                </p>
                <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Image placeholder</span>
                </div>
                <p className="text-[#6b7280] mb-4">
                  Detailed description about {selectedPlace.name} would go here. This would include information about visiting hours, entrance fees, history, and other relevant details.
                </p>
                <button className="w-full bg-[#22c55e] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#16a34a] transition-colors">
                  View Details
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {filteredPlaces.length > 0 ? (
                  filteredPlaces.map(place => (
                    <div 
                      key={place.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedPlace(place);
                        // Also center map on this location
                        if (map) {
                          map.setView([place.lat, place.lng], 15);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className="bg-gray-200 h-16 w-16 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-[#22c55e]" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-[#1f2937]">{place.name}</h3>
                          <p className="text-sm text-[#6b7280]">{place.category}</p>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg key={i} className={`h-3 w-3 ${i < Math.floor(place.rating) ? 'fill-current' : 'stroke-current fill-transparent'}`} viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-[#6b7280]">{place.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#6b7280]">
                    <p>No places found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;