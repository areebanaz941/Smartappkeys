// src/components/admin/NavigationSettingsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavigationSettingsPage = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [cacheAPIResults, setCacheAPIResults] = useState(true);
  const [defaultRouteType, setDefaultRouteType] = useState('walking');
  const [defaultOptimization, setDefaultOptimization] = useState('shortest');
  const [showElevationProfile, setShowElevationProfile] = useState(true);
  const [maxConcurrentRoutes, setMaxConcurrentRoutes] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Navigation Settings</h1>
          <Link 
            to="/admin"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Admin
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Navigation Configuration</h2>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}
          
          {/* API Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">API Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mapbox Access Token
                </label>
                <div className="flex">
                  <input
                    type="password"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md text-sm"
                    placeholder="Token loaded from environment variables"
                    value={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ? "••••••••••••••••••••" : ""}
                    disabled
                    readOnly
                  />
                  <a 
                    href="https://account.mapbox.com/access-tokens/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-200 text-gray-700 px-2 py-2 rounded-r-md text-sm flex items-center"
                  >
                    Manage
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Token is configured via environment variables for security
                </p>
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="cache-api-results"
                    className="h-4 w-4 text-[#032c60] focus:ring-[#032c60] border-gray-300 rounded"
                    checked={cacheAPIResults}
                    onChange={(e) => setCacheAPIResults(e.target.checked)}
                  />
                  <label htmlFor="cache-api-results" className="ml-2 block text-sm text-gray-700">
                    Cache API Results
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Enable caching to reduce API calls and improve performance
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Defaults */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Navigation Defaults</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Route Type
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDefaultRouteType('walking')} 
                    className={`px-4 py-2 rounded-md ${defaultRouteType === 'walking' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                  >
                    Walking
                  </button>
                  <button 
                    onClick={() => setDefaultRouteType('cycling')} 
                    className={`px-4 py-2 rounded-md ${defaultRouteType === 'cycling' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                  >
                    Cycling
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Optimization
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDefaultOptimization('shortest')} 
                    className={`px-4 py-2 rounded-md ${defaultOptimization === 'shortest' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                  >
                    Shortest
                  </button>
                  <button 
                    onClick={() => setDefaultOptimization('fastest')} 
                    className={`px-4 py-2 rounded-md ${defaultOptimization === 'fastest' ? 'bg-[#032c60] text-white' : 'bg-gray-200'}`}
                  >
                    Fastest
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show Elevation Profile
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show-elevation"
                    className="h-4 w-4 text-[#032c60] focus:ring-[#032c60] border-gray-300 rounded"
                    checked={showElevationProfile}
                    onChange={(e) => setShowElevationProfile(e.target.checked)}
                  />
                  <label htmlFor="show-elevation" className="ml-2 block text-sm text-gray-700">
                    Display elevation profiles on routes
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Concurrent Routes
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={maxConcurrentRoutes}
                  onChange={(e) => setMaxConcurrentRoutes(parseInt(e.target.value, 10))}
                  min={1}
                  max={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limit the number of concurrent routes that can be calculated (affects performance)
                </p>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md ${
                isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#032c60] text-white hover:bg-opacity-90'
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSettingsPage;