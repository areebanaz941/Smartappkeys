// src/components/admin/RouteManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RouteManagementPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    // Fetch routes data
    // This is a placeholder - replace with actual API call
    setTimeout(() => {
      setRoutes([
        {
          id: 1,
          name: 'Historic Center Tour',
          description: 'A walk through the historic center of San Lorenzo Nuovo',
          type: 'walking',
          difficultyLevel: 'easy',
          distance: 2.5, // km
          duration: 45, // minutes
          poiCount: 5
        },
        {
          id: 2,
          name: 'Lake Bolsena Circuit',
          description: 'Scenic bike ride along Lake Bolsena',
          type: 'cycling',
          difficultyLevel: 'moderate',
          distance: 12.3, // km
          duration: 90, // minutes
          poiCount: 8
        },
        {
          id: 3,
          name: 'Vineyard Trail',
          description: 'Explore local vineyards and wine production',
          type: 'walking',
          difficultyLevel: 'easy',
          distance: 3.7, // km
          duration: 60, // minutes
          poiCount: 4
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRouteDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      // Delete route logic
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Manage Navigation Routes</h1>
          <Link 
            to="/admin"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Action Buttons */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">Routes ({routes.length})</h2>
          <Link
            to="/admin/routes/new"
            className="bg-[#032c60] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            Create New Route
          </Link>
        </div>

        {/* Routes List */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">Loading routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No routes found. Create your first route!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    POIs
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{route.name}</div>
                      <div className="text-sm text-gray-500">{route.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        route.type === 'walking' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {route.type === 'walking' ? 'Walking' : 'Cycling'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.difficultyLevel.charAt(0).toUpperCase() + route.difficultyLevel.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.distance} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.poiCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRouteDelete(route.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteManagementPage;