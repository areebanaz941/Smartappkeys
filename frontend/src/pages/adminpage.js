// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [stats, setStats] = useState({
    users: 247,
    pois: 42,
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
              <h3 className="font-medium">POI Management</h3>
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
              <h3 className="font-medium">Bike Route Management</h3>
              <span>{activeSection === 'bikeRoutes' ? '−' : '+'}</span>
            </div>
            
            {activeSection === 'bikeRoutes' && (
              <div className="p-4 space-y-3">
                <button className="w-full bg-yellowgreen text-white py-2 px-4 rounded-md hover:bg-[#6aaf1a] transition-colors">
                  Create New Route
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Edit Existing Routes
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Upload GPX File
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Route Statistics
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
              <h3 className="font-medium">Analytics Dashboard</h3>
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
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Point Economy
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">
                  Export Reports
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-medium text-lg mb-4">Platform Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Active POIs</p>
              <p className="text-2xl font-bold">{stats.pois}</p>
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
      </div>
    </div>
  );
};

export default AdminPage;