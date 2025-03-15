import React, { useState, useEffect } from 'react';
import { BarChart, ShoppingBag, Users, Star, Clock, Menu, Plus, Map, FileEdit, Trash2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';

export const BusinessDashboard = () => {
  const [businessProfile, setBusinessProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch business-specific data
    const fetchBusinessData = async () => {
      try {
        // Simulating API responses for demonstration
        const mockData = {
          businessProfile: {
            name: 'Coastal Café',
            type: 'Restaurant / Café',
            address: '123 Harbor Street',
            phone: '+1 (555) 123-4567',
            description: 'Cozy café serving local specialties and fresh seafood.',
            hours: {
              monday: '08:00 - 20:00',
              tuesday: '08:00 - 20:00',
              wednesday: '08:00 - 20:00',
              thursday: '08:00 - 20:00',
              friday: '08:00 - 22:00',
              saturday: '09:00 - 22:00',
              sunday: '09:00 - 18:00'
            },
            verified: true
          },
          analytics: {
            views: {
              total: 1248,
              change: 12, // percentage
              period: 'week'
            },
            bookmarks: {
              total: 85,
              change: 5, // percentage
              period: 'week'
            },
            reviews: {
              count: 47,
              average: 4.7,
              change: 3, // count
              period: 'week'
            },
            orders: {
              total: 128,
              change: 15, // percentage
              period: 'week'
            }
          },
          listings: [
            {
              id: 1,
              name: 'Breakfast Menu',
              type: 'Menu',
              items: 12,
              status: 'active',
              lastUpdated: '2024-03-10'
            },
            {
              id: 2,
              name: 'Coffee Tasting Experience',
              type: 'Experience',
              price: '€15',
              status: 'active',
              lastUpdated: '2024-03-05'
            },
            {
              id: 3,
              name: 'Evening Special Menu',
              type: 'Menu',
              items: 8,
              status: 'draft',
              lastUpdated: '2024-03-12'
            }
          ],
          reviews: [
            {
              id: 1,
              user: 'Emma S.',
              rating: 5,
              comment: 'Great experience! The staff was friendly and the service was excellent.',
              date: '2024-03-15',
              replied: false
            },
            {
              id: 2,
              user: 'James M.',
              rating: 4,
              comment: 'Delicious food and nice atmosphere. A bit noisy during peak hours.',
              date: '2024-03-12',
              replied: true
            },
            {
              id: 3,
              user: 'Laura T.',
              rating: 5,
              comment: 'The coffee was amazing and the seafood pasta was the best I\'ve had in months!',
              date: '2024-03-08',
              replied: false
            }
          ],
          orders: [
            {
              id: 'ORD-1234',
              customer: 'Alex Johnson',
              items: 3,
              total: '€24.50',
              status: 'pending',
              type: 'takeaway',
              time: '10 min ago'
            },
            {
              id: 'ORD-1233',
              customer: 'Maria Garcia',
              table: '5',
              items: 4,
              total: '€32.75',
              status: 'completed',
              type: 'dine-in',
              time: '25 min ago'
            },
            {
              id: 'ORD-1232',
              customer: 'Thomas Weber',
              items: 2,
              total: '€18.90',
              status: 'completed',
              type: 'takeaway',
              time: '1 hour ago'
            }
          ]
        };

        // Update state with fetched data
        setBusinessProfile(mockData.businessProfile);
        setAnalytics(mockData.analytics);
        setListings(mockData.listings);
        setReviews(mockData.reviews);
        setOrders(mockData.orders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching business data:', error);
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  return (
    <DashboardLayout userType="business">
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Business Dashboard
              {businessProfile?.verified && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </h1>
            <p className="text-gray-600">Manage your business profile and connect with customers</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full flex items-center">
              <Map className="h-4 w-4 mr-2" />
              <span>View on Map</span>
            </button>
            <button className="bg-[#22c55e] text-white px-4 py-2 rounded-full flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>New Listing</span>
            </button>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'orders'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
              {orders.filter(order => order.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {orders.filter(order => order.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'listings'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-[#22c55e] text-[#22c55e]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews
              {reviews.filter(review => !review.replied).length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                  {reviews.filter(review => !review.replied).length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analytics Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Profile Views</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.views.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.views.change}% from last {analytics.views.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Bookmarks</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.bookmarks.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.bookmarks.change}% from last {analytics.bookmarks.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Reviews</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-gray-800">{analytics.reviews.count}</p>
                    <div className="ml-2 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm ml-1">{analytics.reviews.average}</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-600">↑ {analytics.reviews.change} new this {analytics.reviews.period}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-sm text-gray-500">Orders</p>
                  <p className="text-xl font-semibold text-gray-800">{analytics.orders.total}</p>
                  <p className="text-xs text-green-600">↑ {analytics.orders.change}% from last {analytics.orders.period}</p>
                </div>
              </div>
            )}

            {/* Business Profile / Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Business Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Profile</h2>
                  <button className="text-[#22c55e] hover:text-[#16a34a] text-sm font-medium">
                    Edit Profile
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                      {/* Placeholder for business image/logo */}
                      <div className="w-full sm:w-1/3 h-48 bg-gray-200 rounded-lg mb-4 sm:mb-0"></div>
                      
                      <div className="sm:w-2/3 space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium">{businessProfile.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p>{businessProfile.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>{businessProfile.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{businessProfile.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{businessProfile.description}</p>
                    </div>
                    
                    <div className="pt-2 flex space-x-2">
                      <button className="px-3 py-1.5 bg-[#22c55e]/10 text-[#22c55e] rounded text-sm">
                        Upload Photos
                      </button>
                      <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm">
                        Update Contact Info
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Business Hours */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Business Hours</h2>
                  <button className="text-[#22c55e] hover:text-[#16a34a] text-sm font-medium">
                    Edit Hours
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Monday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.monday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Tuesday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.tuesday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Wednesday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.wednesday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Thursday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.thursday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Friday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.friday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                      <span className="text-gray-600">Saturday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Sunday</span>
                      <span className="text-sm font-medium">{businessProfile.hours.sunday}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-2 border-t">
                  <button className="w-full py-2 bg-[#22c55e] text-white rounded-lg text-sm font-medium">
                    Set Special Hours
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-[#22c55e] hover:text-[#16a34a] text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-800">{order.id}</h3>
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.customer}
                          {order.table && ` • Table ${order.table}`}
                          {` • ${order.items} items`}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm font-medium">{order.total}</span>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Recent Reviews */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Reviews</h2>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="text-[#22c55e] hover:text-[#16a34a] text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between mb-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 mr-2">{review.user}</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <div className="mt-2">
                          {review.replied ? (
                            <span className="text-xs text-gray-500">You replied to this review</span>
                          ) : (
                            <button className="text-xs text-[#22c55e] hover:underline">Reply to review</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Order Management</h2>
                <div className="flex items-center space-x-2">
                  <select className="border rounded-lg px-3 py-1.5 text-sm bg-white">
                    <option>All Orders</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                  <button className="bg-[#22c55e]/10 text-[#22c55e] px-3 py-1.5 rounded-lg text-sm">
                    Export
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e]"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                          {order.table && <span className="block text-xs">Table {order.table}</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {order.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {order.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              View
                            </button>
                            {order.status === 'pending' && (
                              <button className="text-green-600 hover:text-green-800">
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu or experience.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Your Listings</h2>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                    Filter <ChevronDown className="h-4 w-4 inline ml-1" />
                  </button>
                  <button className="bg-[#22c55e] text-white px-3 py-1.5 rounded-lg text-sm flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    New Listing
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                    </div>
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((listing) => (
                    <div 
                      key={listing.id} 
                      className={`border rounded-lg p-4 ${listing.status === 'draft' ? 'border-dashed bg-gray-50' : ''}`}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-gray-800">{listing.name}</h3>
                        <span 
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            listing.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {listing.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {listing.type}
                        {listing.items && ` • ${listing.items} items`}
                        {listing.price && ` • ${listing.price}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last updated: {new Date(listing.lastUpdated).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <button className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs flex items-center">
                          <FileEdit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        {listing.status === 'draft' ? (
                          <button className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">
                            Publish
                          </button>
                        ) : (
                          <button className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                            Deactivate
                          </button>
                        )}
                        <button className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs flex items-center">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* "Add New" card */}
                  <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 h-full">
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">Create a new listing</p>
                    <div className="mt-3 flex flex-col space-y-2 w-full">
                      <button className="w-full px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs">
                        Add Menu
                      </button>
                      <button className="w-full px-3 py-1.5 bg-purple-50 text-purple-600 rounded text-xs">
                        Add Experience
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No listings</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating your first listing.</p>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button className="px-4 py-2 bg-[#22c55e] text-white rounded-lg text-sm">
                      Add Menu
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm">
                      Add Experience
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Customer Reviews</h2>
                <p className="text-sm text-gray-500">Manage and respond to customer feedback</p>
              </div>
              <div className="flex space-x-2">
                <select className="border rounded-lg px-3 py-1.5 text-sm bg-white">
                  <option>All Reviews</option>
                  <option>Needs Response</option>
                  <option>Responded</option>
                </select>
              </div>
            </div>
            
            {/* Review summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex flex-wrap items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="flex-shrink-0 mr-4">
                  <span className="text-3xl font-bold text-gray-800">{analytics?.reviews.average}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= Math.floor(analytics?.reviews.average) ? 'text-yellow-400 fill-yellow-400' : star <= analytics?.reviews.average ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{analytics?.reviews.count} reviews</p>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center">
                    <span className="text-xs w-12">5 stars</span>
                    <div className="h-2 mx-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-xs w-8">70%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12">4 stars</span>
                    <div className="h-2 mx-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-xs w-8">20%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12">3 stars</span>
                    <div className="h-2 mx-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '5%' }}></div>
                    </div>
                    <span className="text-xs w-8">5%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12">2 stars</span>
                    <div className="h-2 mx-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '3%' }}></div>
                    </div>
                    <span className="text-xs w-8">3%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs w-12">1 star</span>
                    <div className="h-2 mx-2 flex-1 rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-yellow-400" style={{ width: '2%' }}></div>
                    </div>
                    <span className="text-xs w-8">2%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{review.user}</h3>
                          <p className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    {review.replied ? (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">Your reply:</p>
                        <p className="text-sm text-gray-700">Thank you for your feedback! We're glad you enjoyed your experience.</p>
                      </div>
                    ) : (
                      <div>
                        <button className="text-[#22c55e] text-sm hover:underline">
                          Reply to this review
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">When customers leave reviews, they'll appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BusinessDashboard;