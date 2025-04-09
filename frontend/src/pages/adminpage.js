// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, MapPin, Navigation, Bike, Route, Globe, Compass, Settings, BarChart } from 'lucide-react';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [stats, setStats] = useState({
    users: 247,
    pois: 42,
    routes: 15,
    events: 8,
    businesses: 15
  });
  const navigate = useNavigate();

  // Fetch basic stats (you can implement this later)
  useEffect(() => {
    // Placeholder for API calls to get actual statistics
    // Example: fetchStatistics();
  }, []);

  // Function to handle button clicks and show corresponding section
  const handleSectionChange = (section) => {
    setActiveSection(section === activeSection ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#032c60] text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">San Lorenzo Nuovo Smart AppKey - Admin</h1>
          <Link 
            to="/"
            className="bg-white text-[#032c60] px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            Back to Website
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-8">Admin Dashboard</h2>
        
        {/* Admin Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POI Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('poi')}
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <h3 className="font-medium">POI Management</h3>
              </div>
              <span>{activeSection === 'poi' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'poi' && (
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/admin/poi/new')}
                  className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors"
                >
                  Add New POI
                </button>
                <button 
                  onClick={() => navigate('/admin/poi')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Manage POIs
                </button>
                <button 
                  onClick={() => navigate('/admin/poi/map')}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  View POI Map
                </button>
                <button 
                  onClick={() => navigate('/admin/poi/bulk-upload')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Bulk Upload POIs
                </button>
                <button 
                  onClick={() => navigate('/admin/poi/analytics')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  View POI Analytics
                </button>
              </div>
            )}
          </div>

          {/* Bike Route Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('bikeRoutes')}
            >
              <div className="flex items-center">
                <Bike className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Bike Route Management</h3>
              </div>
              <span>{activeSection === 'bikeRoutes' ? '−' : '+'}</span>
            </div>
     
            {activeSection === 'bikeRoutes' && (
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/admin/bike-routes/new')}
                  className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors"
                >
                  Create New Route
                </button>
                <button 
                  onClick={() => navigate('/admin/bike-routes')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Edit Existing Routes
                </button>
                <button 
                  onClick={() => navigate('/admin/bike-routes/map')}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  View GPX Route Map
                </button>
                <button 
                  onClick={() => navigate('/admin/bike-routes/upload')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Upload GPX File
                </button>
                <button 
                  onClick={() => navigate('/admin/bike-routes/statistics')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Route Statistics
                </button>
              </div>
            )}
          </div>

          {/* Maps & Navigation */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('maps')}
            >
              <div className="flex items-center">
                <Map className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Maps & Navigation</h3>
              </div>
              <span>{activeSection === 'maps' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'maps' && (
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/map')}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                >
                  Interactive POI Map
                </button>
                <button 
                  onClick={() => navigate('/gpx-track-map')}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Bike Route Map
                </button>
                <button 
                  onClick={() => navigate('/admin/navigation/routes')}
                  className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors"
                >
                  Manage Navigation Routes
                </button>
                <button 
                  onClick={() => navigate('/admin/navigation/settings')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Map Settings
                </button>
              </div>
            )}
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('users')}
            >
              <h3 className="font-medium">User Management</h3>
              <span>{activeSection === 'users' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'users' && (
              <div className="p-4 space-y-3">
                <button className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors">
                  View All Users
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Manage Memberships
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  User Analytics
                </button>
              </div>
            )}
          </div>

          {/* Event Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('events')}
            >
              <h3 className="font-medium">Event Management</h3>
              <span>{activeSection === 'events' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'events' && (
              <div className="p-4 space-y-3">
                <button className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors">
                  Create New Event
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Pending Approvals
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Event Calendar
                </button>
              </div>
            )}
          </div>

          {/* Business Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('business')}
            >
              <h3 className="font-medium">Business Management</h3>
              <span>{activeSection === 'business' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'business' && (
              <div className="p-4 space-y-3">
                <button className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors">
                  Add New Business
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Pending Approvals
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Business Analytics
                </button>
              </div>
            )}
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('analytics')}
            >
              <div className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Analytics Dashboard</h3>
              </div>
              <span>{activeSection === 'analytics' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'analytics' && (
              <div className="p-4 space-y-3">
                <button className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors">
                  Platform Overview
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  User Engagement
                </button>
                <button 
                  onClick={() => navigate('/admin/maps/analytics')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Map Usage Analytics
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Export Reports
                </button>
              </div>
            )}
          </div>

          {/* Navigation Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('navigation')}
            >
              <div className="flex items-center">
                <Compass className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Navigation Management</h3>
              </div>
              <span>{activeSection === 'navigation' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'navigation' && (
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/admin/navigation/routes')}
                  className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors"
                >
                  Manage Navigation Routes
                </button>
                <button 
                  onClick={() => navigate('/route-planner')}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Interactive Route Planner
                </button>
                <button 
                  onClick={() => navigate('/admin/navigation/settings')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Navigation Settings
                </button>
                <button 
                  onClick={() => navigate('/admin/navigation/analytics')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Usage Analytics
                </button>
              </div>
            )}
          </div>
            
          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div 
              className="bg-[#032c60] text-white p-4 cursor-pointer flex justify-between items-center"
              onClick={() => handleSectionChange('settings')}
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                <h3 className="font-medium">System Settings</h3>
              </div>
              <span>{activeSection === 'settings' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'settings' && (
              <div className="p-4 space-y-3">
                <button 
                  onClick={() => navigate('/admin/settings/maps')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Map Configuration
                </button>
                <button 
                  onClick={() => navigate('/admin/settings/api')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  API Keys
                </button>
                <button 
                  onClick={() => navigate('/admin/settings/backup')}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Backup & Restore
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Active POIs</p>
              <p className="text-2xl font-bold">{stats.pois}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Bike Routes</p>
              <p className="text-2xl font-bold">{stats.routes}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Upcoming Events</p>
              <p className="text-2xl font-bold">{stats.events}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Business Partners</p>
              <p className="text-2xl font-bold">{stats.businesses}</p>
            </div>
          </div>
        </div>
        
        {/* Quick Access Links */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Link 
            to="/map"
            className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <MapPin className="h-4 w-4 mr-1" />
            POI Map
          </Link>
          <Link 
            to="/gpx-track-map"
            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <Bike className="h-4 w-4 mr-1" />
            Bike Routes
          </Link>
          <Link 
            to="/route-planner"
            className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Route Planner
          </Link>
          <Link 
            to="/admin/poi/new"
            className="inline-flex items-center px-4 py-2 bg-yellowgreen bg-opacity-20 text-yellowgreen rounded-md hover:bg-opacity-30"
          >
            <Plus className="h-4 w-4 mr-1" />
            New POI
          </Link>
          <Link 
            to="/admin/bike-routes/upload"
            className="inline-flex items-center px-4 py-2 bg-yellowgreen bg-opacity-20 text-yellowgreen rounded-md hover:bg-opacity-30"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload GPX
          </Link>
        </div>
      </div>
    </div>
  );
};

// Add these icons for the quick access links
const Plus = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5v14M5 12h14"></path>
  </svg>
);

const Upload = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default AdminPage;