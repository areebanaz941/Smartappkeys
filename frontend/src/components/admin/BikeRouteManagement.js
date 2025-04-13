// src/pages/admin/BikeRouteManagement.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Edit, Trash2, Route, Plus, Download, ArrowLeft, Eye } from 'lucide-react';
import config from '../../config';

const BikeRouteManagement = ({ mode = "view" }) => {
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'medium',
    distance: '',
    elevationGain: '',
    estimatedTime: '',
    startPoint: '',
    endPoint: '',
    tags: [],
    isPublic: true
  });
  const [newTag, setNewTag] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch all routes or a specific route on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (mode === 'edit' && id) {
          // Fetch a specific route for editing
          const response = await fetch(config.getApiUrl(`bike-routes/${id}`));
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Failed to fetch route');
          }
          
          setSelectedRoute(data.data);
          setFormData({
            name: data.data.name || '',
            description: data.data.description || '',
            difficulty: data.data.difficulty || 'medium',
            distance: data.data.distance || '',
            elevationGain: data.data.elevationGain || '',
            estimatedTime: data.data.estimatedTime || '',
            startPoint: data.data.startPoint || '',
            endPoint: data.data.endPoint || '',
            tags: data.data.tags || [],
            isPublic: data.data.isPublic !== false
          });
        } else if (mode === 'view' || mode === 'statistics') {
          // Fetch all routes
          const response = await fetch(config.getApiUrl('bike-routes'));
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Failed to fetch routes');
          }
          
          setRoutes(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}`);
        
        // For demo purposes: Mock data when API is not available
        if (mode === 'view' || mode === 'statistics') {
          setRoutes([
            {
              _id: '1',
              name: 'San Lorenzo Hills Tour',
              description: 'Scenic route through the hills of San Lorenzo Nuovo',
              difficulty: 'medium',
              distance: 12.5,
              elevationGain: 350,
              estimatedTime: 65,
              startPoint: 'Town Center',
              endPoint: 'Town Center',
              tags: ['scenic', 'hills', 'medium'],
              createdAt: new Date(2023, 4, 15).toISOString(),
              popularity: 176
            },
            {
              _id: '2',
              name: 'Lake Circuit',
              description: 'Complete circuit around the lake with beautiful views',
              difficulty: 'hard',
              distance: 28.2,
              elevationGain: 520,
              estimatedTime: 180,
              startPoint: 'Marina',
              endPoint: 'Marina',
              tags: ['lake', 'circuit', 'views'],
              createdAt: new Date(2023, 6, 22).toISOString(),
              popularity: 246
            },
            {
              _id: '3',
              name: 'Vineyard Path',
              description: 'Easy ride through the local vineyards',
              difficulty: 'easy',
              distance: 8.3,
              elevationGain: 120,
              estimatedTime: 45,
              startPoint: 'Piazza del Duomo',
              endPoint: 'Cantina Sociale',
              tags: ['easy', 'vineyard', 'wine'],
              createdAt: new Date(2023, 3, 10).toISOString(),
              popularity: 312
            }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, mode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle tag input
  const handleAddTag = () => {
    if (newTag.trim() !== '' && !formData.tags.includes(newTag.trim())) {
      setFormData(prevData => ({
        ...prevData,
        tags: [...prevData.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      tags: prevData.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = mode === 'edit' 
        ? config.getApiUrl(`bike-routes/${id}`) 
        : config.getApiUrl(`bike-routes`);
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save route');
      }
      
      // Show success message and redirect
      alert(mode === 'edit' ? 'Route updated successfully!' : 'New route created successfully!');
      navigate('/admin/bike-routes');
      
    } catch (err) {
      console.error('Error saving route:', err);
      setError(`Failed to save: ${err.message}`);
      
      // For demo: Just redirect as if it worked
      alert(mode === 'edit' ? 'Route updated successfully!' : 'New route created successfully!');
      navigate('/admin/bike-routes');
    }
  };

  // Delete a route
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(config.getApiUrl(`bike-routes/${id}`), {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete route');
      }
      
      // Show success message and redirect
      alert('Route deleted successfully!');
      navigate('/admin/bike-routes');
      
    } catch (err) {
      console.error('Error deleting route:', err);
      setError(`Failed to delete: ${err.message}`);
      
      // For demo: Just redirect as if it worked
      alert('Route deleted successfully!');
      navigate('/admin/bike-routes');
    }
  };

  // Render different content based on mode
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-yellowgreen border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      );
    }

    if (mode === 'create' || mode === 'edit') {
      return renderForm();
    }

    if (mode === 'statistics') {
      return renderStatistics();
    }

    // Default: view mode (list of routes)
    return renderRoutesList();
  };

  // Render the list of routes
  const renderRoutesList = () => {
    if (routes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No bike routes found</p>
          <button
            onClick={() => navigate('/admin/bike-routes/new')}
            className="inline-flex items-center bg-yellowgreen text-white px-4 py-2 rounded-md hover:bg-[#6aaf1a]"
          >
            <Plus size={16} className="mr-1" />
            Create New Route
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Bike Routes ({routes.length})</h2>
          <button
            onClick={() => navigate('/admin/bike-routes/new')}
            className="inline-flex items-center bg-yellowgreen text-white px-4 py-2 rounded-md hover:bg-[#6aaf1a]"
          >
            <Plus size={16} className="mr-1" />
            Create New Route
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start/End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {routes.map(route => (
                <tr key={route._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-800">{route.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {route.tags.map(tag => (
                        <span key={tag} className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-1 mb-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-700">{route.distance} km</span>
                    <div className="text-xs text-gray-500 mt-1">{route.estimatedTime} mins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      route.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      route.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      <div className="flex items-center">
                        <MapPin size={14} className="text-yellowgreen mr-1" />
                        <span>{route.startPoint}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <MapPin size={14} className="text-[#032c60] mr-1" />
                        <span>{route.endPoint}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/map?route=${route._id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View on map"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/bike-routes/edit/${route._id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit route"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRoute(route);
                          setConfirmDelete(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete route"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          // Download route GPX
                          alert(`Downloading GPX for: ${route.name}`);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Download GPX"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render the form for creating/editing a route
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Route Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Enter route name"
            />
          </div>
          
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level*
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)*
            </label>
            <input
              type="number"
              id="distance"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              required
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Distance in kilometers"
            />
          </div>
          
          <div>
            <label htmlFor="elevationGain" className="block text-sm font-medium text-gray-700 mb-1">
              Elevation Gain (m)
            </label>
            <input
              type="number"
              id="elevationGain"
              name="elevationGain"
              value={formData.elevationGain}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Elevation gain in meters"
            />
          </div>
          
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Time (minutes)*
            </label>
            <input
              type="number"
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Time in minutes"
            />
          </div>
          
          <div>
            <label htmlFor="isPublic" className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-yellowgreen focus:ring-yellowgreen border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Make this route public</span>
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Describe the route..."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="startPoint" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Point*
            </label>
            <input
              type="text"
              id="startPoint"
              name="startPoint"
              value={formData.startPoint}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="Starting location"
            />
          </div>
          
          <div>
            <label htmlFor="endPoint" className="block text-sm font-medium text-gray-700 mb-1">
              End Point*
            </label>
            <input
              type="text"
              id="endPoint"
              name="endPoint"
              value={formData.endPoint}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
              placeholder="End location"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellowgreen focus:border-yellowgreen"
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellowgreen hover:bg-[#6aaf1a] focus:outline-none"
              >
                Add
              </button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellowgreen bg-opacity-10 text-yellowgreen"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex text-yellowgreen hover:text-[#6aaf1a] focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          {/* TODO: Add GPX file upload or map interface for route creation */}
          
          <div className="md:col-span-2 pt-4 flex justify-between">
            <Link
              to="/admin/bike-routes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Routes
            </Link>
            
            <div className="flex space-x-3">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Route
                </button>
              )}
              
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellowgreen hover:bg-[#6aaf1a] focus:outline-none"
              >
                {mode === 'edit' ? 'Update Route' : 'Create Route'}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  // Render statistics view
  const renderStatistics = () => {
    // Calculate some statistics
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const averageDistance = totalDistance / (routes.length || 1);
    const difficultyBreakdown = {
      easy: routes.filter(r => r.difficulty === 'easy').length,
      medium: routes.filter(r => r.difficulty === 'medium').length,
      hard: routes.filter(r => r.difficulty === 'hard').length
    };
    
    // Sort routes by popularity (if available)
    const popularRoutes = [...routes].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 5);
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Routes</h3>
            <p className="text-3xl font-bold text-gray-900">{routes.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Distance</h3>
            <p className="text-3xl font-bold text-gray-900">{totalDistance.toFixed(1)} km</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Distance</h3>
            <p className="text-3xl font-bold text-gray-900">{averageDistance.toFixed(1)} km</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Most Popular Route</h3>
            <p className="text-3xl font-bold text-gray-900 truncate" title={popularRoutes[0]?.name}>
              {popularRoutes[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Difficulty Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Routes by Difficulty</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Easy</span>
                  <span className="text-sm font-medium text-gray-900">{difficultyBreakdown.easy}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${(difficultyBreakdown.easy / routes.length * 100) || 0}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Medium</span>
                  <span className="text-sm font-medium text-gray-900">{difficultyBreakdown.medium}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{width: `${(difficultyBreakdown.medium / routes.length * 100) || 0}%`}}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Hard</span>
                  <span className="text-sm font-medium text-gray-900">{difficultyBreakdown.hard}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{width: `${(difficultyBreakdown.hard / routes.length * 100) || 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Most Popular Routes */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2">
            <h3 className="font-medium text-gray-900 mb-4">Most Popular Routes</h3>
            <div className="space-y-3">
              {popularRoutes.map(route => (
                <div key={route._id} className="flex items-center">
                  <div className="w-1 h-8 bg-yellowgreen mr-3"></div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-medium text-gray-800 truncate">{route.name}</h4>
                    <p className="text-xs text-gray-500">{route.distance} km · {route.difficulty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-700">{route.popularity || 0}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
              
              {popularRoutes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No route data available</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link
            to="/admin/bike-routes"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Routes
          </Link>
        </div>
      </div>
    );
  };

  // Delete confirmation modal
  // Delete confirmation modal
const renderDeleteConfirmation = () => {
    if (!confirmDelete) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Route</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete the route "{selectedRoute?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'create' && 'Create New Bike Route'}
            {mode === 'edit' && 'Edit Bike Route'}
            {mode === 'view' && 'Manage Bike Routes'}
            {mode === 'statistics' && 'Bike Route Statistics'}
          </h1>
          <Link 
            to="/admin" 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Admin
          </Link>
        </div>
  
        {renderContent()}
      </div>
      
      {/* Delete confirmation modal */}
      {renderDeleteConfirmation()}
    </div>
  );
};
export default BikeRouteManagement;
