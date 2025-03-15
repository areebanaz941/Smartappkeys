import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Bell, Heart, Award, Map, Plus, MessageCircle, Settings } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export const ResidentDashboard = () => {
  const [hostedEvents, setHostedEvents] = useState([]);
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [nearbyGuests, setNearbyGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch resident-specific data
    const fetchResidentData = async () => {
      try {
        // In a real application, these would be separate API calls
        // Simulating API responses for demonstration
        const mockData = {
          hostedEvents: [
            { id: 1, title: 'Community Cleanup Day', date: '2024-03-30', attendees: 12, status: 'upcoming' },
            { id: 2, title: 'Local Food Tour', date: '2024-04-05', attendees: 8, status: 'upcoming' },
            { id: 3, title: 'Cultural Workshop', date: '2024-03-15', attendees: 15, status: 'completed' }
          ],
          points: 350,
          rewards: [
            { id: 1, title: 'Free Bike Rental', points: 200, redeemed: false },
            { id: 2, title: 'Local Restaurant 20% Off', points: 150, redeemed: true }
          ],
          nearbyGuests: [
            { id: 1, name: 'Emma T.', distance: '0.5km', interests: ['Local Cuisine', 'Historical Landmarks'] },
            { id: 2, name: 'James S.', distance: '1.2km', interests: ['Hiking', 'Cultural Activities'] }
          ]
        };

        // Update state with fetched data
        setHostedEvents(mockData.hostedEvents);
        setPoints(mockData.points);
        setRewards(mockData.rewards);
        setNearbyGuests(mockData.nearbyGuests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resident data:', error);
        setLoading(false);
      }
    };

    fetchResidentData();
  }, []);

  // Filter events into upcoming and past
  const upcomingEvents = hostedEvents.filter(event => event.status === 'upcoming');
  const pastEvents = hostedEvents.filter(event => event.status === 'completed');

  return (
    <DashboardLayout userType="resident">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Resident Dashboard</h1>
            <p className="text-gray-600">Welcome to your community hub</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full flex items-center">
              <Award className="h-5 w-5 mr-2" />
              <span className="font-semibold">{points} Points</span>
            </div>
            <button className="bg-[#22c55e] text-white px-4 py-2 rounded-full flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>Host Event</span>
            </button>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hosted Events Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Hosted Events</h2>
                <a href="/resident-events" className="text-[#22c55e] text-sm font-medium hover:underline flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Manage Events
                </a>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-500">{event.attendees} attendees</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
                          Edit Event
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>You haven't hosted any events yet</p>
                  <button className="mt-4 px-4 py-2 bg-[#22c55e] text-white rounded-full text-sm font-medium">
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Map Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Nearby Activities</h2>
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
                  All Activities
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                  Events
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                  Bike Routes
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                  Food & Drinks
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap">
                  Experiences
                </button>
              </div>
            </div>

            {/* Past Events and Stats */}
            {pastEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.slice(0, 2).map(event => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-gray-500">{event.attendees} attendees</span>
                        <button className="text-[#22c55e] text-xs hover:underline">
                          View Feedback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Points & Rewards */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Rewards & Points</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Your Points</span>
                  <span className="font-semibold text-[#22c55e]">{points}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" 
                    style={{ width: `${Math.min((points / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>500</span>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-700 mb-3">Available Rewards</h3>
              <div className="space-y-3">
                {rewards.map(reward => (
                  <div 
                    key={reward.id}
                    className={`border rounded-lg p-3 ${reward.redeemed ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{reward.title}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {reward.points} pts
                      </span>
                    </div>
                    <div className="mt-2">
                      {reward.redeemed ? (
                        <span className="text-xs text-gray-500">Redeemed</span>
                      ) : (
                        <button className="text-xs text-[#22c55e] hover:underline">
                          Redeem Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <a href="/resident-rewards" className="block text-center mt-4 text-[#22c55e] text-sm font-medium hover:underline">
                View All Rewards
              </a>
            </div>
            
            {/* Nearby Guests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Guests Nearby</h2>
              
              {nearbyGuests.length > 0 ? (
                <div className="space-y-4">
                  {nearbyGuests.map(guest => (
                    <div key={guest.id} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        {guest.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-800">{guest.name}</h3>
                          <span className="text-xs text-gray-500">{guest.distance}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {guest.interests.slice(0, 2).map((interest, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                            >
                              {interest}
                            </span>
                          ))}
                          {guest.interests.length > 2 && (
                            <span className="text-xs text-gray-500 px-1">
                              +{guest.interests.length - 2} more
                            </span>
                          )}
                        </div>
                        <button className="mt-2 flex items-center text-xs text-[#22c55e] hover:underline">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Send Message
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <a href="/resident-connections" className="block text-center mt-2 text-[#22c55e] text-sm font-medium hover:underline">
                    View All Nearby Guests
                  </a>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>No guests nearby at the moment</p>
                </div>
              )}
            </div>
            
            {/* Community Updates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Community Updates</h2>
              
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <h3 className="font-medium text-gray-800">New Bike Route Added</h3>
                  <p className="text-sm text-gray-500 mt-1">The "Coastal Heritage Trail" is now available for residents to explore.</p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                </div>
                <div className="border-b pb-3">
                  <h3 className="font-medium text-gray-800">Community Meeting</h3>
                  <p className="text-sm text-gray-500 mt-1">Join us on April 15th to discuss upcoming neighborhood improvements.</p>
                  <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                </div>
              </div>
              
              <a href="/community-updates" className="block text-center mt-4 text-[#22c55e] text-sm font-medium hover:underline">
                View All Updates
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResidentDashboard;