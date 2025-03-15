import React, { useState, useEffect } from 'react';
import { MapPin, Map, Calendar, Star, Heart, Award, Bike, Coffee, Navigation, Search, MessageCircle, Users } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export const TouristDashboard = () => {
  const [attractions, setAttractions] = useState([]);
  const [events, setEvents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [bikeRoutes, setBikeRoutes] = useState([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [localResidents, setLocalResidents] = useState([]);

  useEffect(() => {
    // Fetch tourist-specific data
    const fetchTouristData = async () => {
      try {
        // Simulating API responses for demonstration
        const mockData = {
          attractions: [
            {
              id: 1,
              title: 'City Museum',
              image: '/placeholder/museum.jpg',
              rating: 4.8,
              reviewCount: 128,
              description: 'Historic museum with interactive exhibits for all ages.',
              distance: '0.7km'
            },
            {
              id: 2,
              title: 'Harbor Viewpoint',
              image: '/placeholder/harbor.jpg',
              rating: 4.6,
              reviewCount: 93,
              description: 'Scenic overlook with panoramic views of the bay and city skyline.',
              distance: '1.2km'
            },
            {
              id: 3,
              title: 'Botanical Gardens',
              image: '/placeholder/garden.jpg',
              rating: 4.5,
              reviewCount: 76,
              description: 'Lush gardens featuring native and exotic plant species.',
              distance: '2.3km'
            }
          ],
          events: [
            {
              id: 1,
              title: 'Food Festival',
              date: '2024-03-23',
              time: '12:00 PM - 8:00 PM',
              description: 'Sample cuisine from over 30 local restaurants and food vendors.',
              location: 'City Center'
            },
            {
              id: 2,
              title: 'Street Art Tour',
              date: '2024-03-25',
              time: '10:00 AM',
              description: 'Guided walking tour of the city\'s vibrant street art scene.',
              location: 'Arts District'
            }
          ],
          recommendations: [
            {
              id: 1,
              title: 'Guided City Tour',
              type: 'Based on your interests',
              description: '3-hour walking tour exploring the city\'s historical landmarks.',
              price: '€25',
              availableSlots: 8
            },
            {
              id: 2,
              title: 'Local Craft Beer Tasting',
              type: 'Based on your interests',
              description: 'Visit three local breweries and sample their signature beers.',
              price: '€35',
              availableSlots: 5
            },
            {
              id: 3,
              title: 'Sunset Kayak Experience',
              type: 'Popular with tourists',
              description: 'Paddle through the bay while enjoying the sunset views.',
              price: '€40',
              availableSlots: 3
            }
          ],
          bikeRoutes: [
            {
              id: 1,
              name: 'Coastal Route',
              distance: '8.5 km',
              difficulty: 'Easy',
              time: '45 min',
              highlights: ['Beach', 'Harbor', 'Lighthouse']
            },
            {
              id: 2,
              name: 'Historic Center Loop',
              distance: '5.2 km',
              difficulty: 'Easy',
              time: '30 min',
              highlights: ['Old Town', 'Cathedral', 'Market Square']
            }
          ],
          points: 175,
          localResidents: [
            { id: 1, name: 'Marco L.', rating: 4.9, expertise: 'Local History', available: true },
            { id: 2, name: 'Sofia G.', rating: 4.8, expertise: 'Food & Restaurants', available: false }
          ]
        };

        // Update state with fetched data
        setAttractions(mockData.attractions);
        setEvents(mockData.events);
        setRecommendations(mockData.recommendations);
        setBikeRoutes(mockData.bikeRoutes);
        setPoints(mockData.points);
        setLocalResidents(mockData.localResidents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tourist data:', error);
        setLoading(false);
      }
    };

    fetchTouristData();
  }, []);

  return (
    <DashboardLayout userType="tourist">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to your Tourist Dashboard</h1>
            <p className="text-gray-600">Discover the best experiences this destination has to offer</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full flex items-center">
              <Award className="h-5 w-5 mr-2" />
              <span className="font-semibold">{points} Points</span>
            </div>
            <button className="bg-[#22c55e] text-white px-4 py-2 rounded-full flex items-center">
              <Map className="h-4 w-4 mr-2" />
              <span>Explore Map</span>
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="bg-white rounded-full shadow-sm p-2 flex items-center">
          <Search className="h-5 w-5 text-gray-400 ml-2 mr-1" />
          <input 
            type="text" 
            placeholder="Search for attractions, events, or bike routes..." 
            className="flex-1 py-2 px-3 bg-transparent border-none focus:outline-none text-gray-700"
          />
          <button className="bg-[#22c55e] text-white rounded-full px-5 py-2 text-sm font-medium">
            Search
          </button>
        </div>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Map Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Discover Nearby</h2>
                <a href="/map" className="text-[#22c55e] text-sm font-medium hover:underline flex items-center">
                  <Map className="h-4 w-4 mr-1" />
                  Open Full Map
                </a>
              </div>
              
              <div className="bg-gray-200 h-64 rounded-lg relative overflow-hidden">
                {/* Placeholder for interactive map - would be replaced with actual map component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">Interactive Map Loading...</p>
                </div>
                
                {/* Map controls overlay */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button className="p-2 bg-white rounded-full shadow-md">
                    <Map className="h-4 w-4 text-gray-700" />
                  </button>
                  <button className="p-2 bg-white rounded-full shadow-md">
                    <MapPin className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                <button className="px-3 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded-full text-xs font-medium whitespace-nowrap">
                  All POIs
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap flex items-center">
                  <Bike className="h-3 w-3 mr-1" />
                  Bike Routes
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap flex items-center">
                  <Coffee className="h-3 w-3 mr-1" />
                  Food & Drinks
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Events
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Attractions
                </button>
              </div>
            </div>

            {/* Popular Attractions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Popular Attractions</h2>
                <a href="/tourist-attractions" className="text-[#22c55e] text-sm font-medium hover:underline">
                  View all attractions
                </a>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {attractions.map(attraction => (
                    <div key={attraction.id} className="border-b pb-4 last:border-0">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image placeholder */}
                        <div className="aspect-video md:w-1/3 bg-gray-200 rounded-lg"></div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium text-gray-800">{attraction.title}</h3>
                            <span className="text-xs text-gray-500">{attraction.distance}</span>
                          </div>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= Math.floor(attraction.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 ml-1">({attraction.reviewCount} reviews)</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{attraction.description}</p>
                          
                          <div className="mt-3 flex space-x-2">
                            <button className="px-3 py-1 bg-[#22c55e] text-white rounded-full text-xs font-medium">
                              View Details
                            </button>
                            <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              Save
                            </button>
                            <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium flex items-center">
                              <Navigation className="h-3 w-3 mr-1" />
                              Directions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events This Week */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Events This Week</h2>
                <a href="/tourist-events" className="text-[#22c55e] text-sm font-medium hover:underline">
                  View all events
                </a>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="border-b pb-3 last:border-0">
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} • {event.time}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 inline mr-1" />{event.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <div className="mt-2 flex space-x-2">
                        <button className="px-3 py-1 bg-[#22c55e] text-white rounded-full text-xs font-medium">
                          Learn More
                        </button>
                        <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No events scheduled for this week</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* For You - Personalized Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">For You</h2>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map(recommendation => (
                    <div key={recommendation.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-gray-800">{recommendation.title}</h3>
                      <p className="text-xs text-blue-500">{recommendation.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm font-medium">{recommendation.price}</span>
                        <span className="text-xs text-gray-500">{recommendation.availableSlots} slots left</span>
                      </div>
                      <button className="mt-2 w-full py-1.5 bg-[#22c55e] text-white rounded-full text-xs font-medium">
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Complete your preferences to get personalized recommendations</p>
                </div>
              )}
              
              <a href="/tourist-recommendations" className="block text-center mt-4 text-[#22c55e] text-sm font-medium hover:underline">
                Explore more recommendations
              </a>
            </div>
            
            {/* Bike Routes */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Bike Routes</h2>
                <a href="/tourist-bike-routes" className="text-[#22c55e] text-sm font-medium hover:underline flex items-center">
                  <Bike className="h-4 w-4 mr-1" />
                  View All
                </a>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                </div>
              ) : bikeRoutes.length > 0 ? (
                <div className="space-y-3">
                  {bikeRoutes.map(route => (
                    <div key={route.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-800">{route.name}</h3>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {route.distance}
                            </span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                              {route.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">
                              {route.time}
                            </span>
                          </div>
                        </div>
                        <button className="p-1.5 bg-[#22c55e]/10 text-[#22c55e] rounded-full">
                          <Navigation className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {route.highlights.map((highlight, index) => (
                          <span key={index} className="text-xs text-gray-500">
                            {index > 0 ? ' • ' : ''}{highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Bike className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No bike routes available in this area</p>
                </div>
              )}
            </div>
            
            {/* Connect with Locals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Connect with Locals</h2>
              
              {localResidents.length > 0 ? (
                <div className="space-y-4">
                  {localResidents.map(resident => (
                    <div key={resident.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                          {resident.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-800">{resident.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="text-xs text-gray-600">{resident.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Expert in: {resident.expertise}</p>
                          
                          {resident.available ? (
                            <button className="mt-2 flex items-center text-xs text-[#22c55e]">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Message Now
                            </button>
                          ) : (
                            <p className="mt-2 text-xs text-gray-500">
                              Available tomorrow
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <a href="/tourist-locals" className="block text-center mt-2 text-[#22c55e] text-sm font-medium hover:underline">
                    Find More Local Guides
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No local guides available at the moment</p>
                </div>
              )}
            </div>
            
            {/* Points & Gamification */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Journey</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Explorer Points</span>
                  <span className="font-semibold text-blue-500">{points}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                    style={{ width: `${Math.min((points / 300) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>300</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 text-sm mb-2">Recent Achievements</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <MapPin className="h-3 w-3 text-blue-500" />
                      </div>
                      <span className="text-xs">First Check-in</span>
                    </div>
                    <span className="text-xs text-gray-500">+25 pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                        <Bike className="h-3 w-3 text-green-500" />
                      </div>
                      <span className="text-xs">Completed Coastal Route</span>
                    </div>
                    <span className="text-xs text-gray-500">+50 pts</span>
                  </div>
                </div>
              </div>
              
              <a href="/tourist-achievements" className="block text-center mt-4 text-[#22c55e] text-sm font-medium hover:underline">
                View All Achievements
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TouristDashboard;