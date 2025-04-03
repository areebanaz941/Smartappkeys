// src/components/admin/NavigationAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NavigationAnalyticsPage = () => {
  const [timeFilter, setTimeFilter] = useState('last30days');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call to fetch analytics data
    setTimeout(() => {
      // Mock data for demonstration
      const mockData = {
        totalNavigations: 1248,
        totalDistance: 3726.5, // km
        totalDuration: 498, // hours
        activeUsers: 247,
        popularRoutes: [
          { id: 1, name: 'Historic Center Tour', count: 286, type: 'walking' },
          { id: 2, name: 'Lake Bolsena Circuit', count: 203, type: 'cycling' },
          { id: 3, name: 'Vineyard Trail', count: 156, type: 'walking' },
          { id: 4, name: 'Mountain View Path', count: 124, type: 'walking' },
          { id: 5, name: 'Countryside Cycling Loop', count: 98, type: 'cycling' }
        ],
        routeTypeDistribution: {
          walking: 67,
          cycling: 33
        },
        navigationsByDay: [
          { day: 'Monday', count: 156 },
          { day: 'Tuesday', count: 142 },
          { day: 'Wednesday', count: 168 },
          { day: 'Thursday', count: 187 },
          { day: 'Friday', count: 212 },
          { day: 'Saturday', count: 256 },
          { day: 'Sunday', count: 127 }
        ],
        averageRating: 4.2,
        completionRate: 84 // percentage
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1500);
  }, [timeFilter]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Navigation Analytics</h1>
          <Link 
            to="/admin"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Time Filter */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Usage Statistics</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setTimeFilter('last7days')} 
              className={`px-4 py-2 rounded-md ${timeFilter === 'last7days' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setTimeFilter('last30days')} 
              className={`px-4 py-2 rounded-md ${timeFilter === 'last30days' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeFilter('last90days')} 
              className={`px-4 py-2 rounded-md ${timeFilter === 'last90days' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm mb-1">Total Navigations</h3>
                <p className="text-3xl font-bold">{analyticsData.totalNavigations.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm mb-1">Total Distance</h3>
                <p className="text-3xl font-bold">{analyticsData.totalDistance.toLocaleString()} km</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm mb-1">Active Users</h3>
                <p className="text-3xl font-bold">{analyticsData.activeUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm mb-1">Completion Rate</h3>
                <p className="text-3xl font-bold">{analyticsData.completionRate}%</p>
              </div>
            </div>

            {/* Route Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium mb-4">Route Type Distribution</h3>
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-l-full" 
                    style={{ width: `${analyticsData.routeTypeDistribution.walking}%` }}
                  >
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                    <span className="text-sm">Walking: {analyticsData.routeTypeDistribution.walking}%</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-gray-200 rounded-full mr-1"></span>
                    <span className="text-sm">Cycling: {analyticsData.routeTypeDistribution.cycling}%</span>
                  </div>
                </div>
              </div>

              {/* Activity by Day */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium mb-4">Navigations by Day</h3>
                <div className="flex items-end h-40 space-x-3">
                  {analyticsData.navigationsByDay.map((day) => (
                    <div key={day.day} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-[#032c60] rounded-t" 
                        style={{ 
                          height: `${(day.count / Math.max(...analyticsData.navigationsByDay.map(d => d.count))) * 100}%`,
                          minHeight: '4px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1">{day.day.substring(0, 3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Popular Routes */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-medium mb-4">Most Popular Routes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.popularRoutes.map((route, index) => (
                      <tr key={route.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{route.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                route.type === 'walking' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {route.type === 'walking' ? 'Walking' : 'Cycling'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{route.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

{/* User Satisfaction */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="font-medium mb-4">Average Route Rating</h3>
    <div className="flex items-center mb-2">
      <div className="text-3xl font-bold mr-3">{analyticsData.averageRating.toFixed(1)}</div>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-6 h-6 ${
              star <= Math.round(analyticsData.averageRating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
    <p className="text-sm text-gray-500">Based on user feedback after navigation</p>
  </div>

  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="font-medium mb-4">Export Analytics</h3>
    <p className="mb-4 text-sm text-gray-600">
      Download analytics data for further analysis or reporting.
    </p>
    <div className="flex gap-3">
      <button className="bg-[#032c60] text-white px-4 py-2 rounded-md text-sm hover:bg-opacity-90">
        Export as CSV
      </button>
      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300">
        Export as PDF
      </button>
    </div>
  </div>
</div>
</>
)}
</div>
</div>
);
};

export default NavigationAnalyticsPage;