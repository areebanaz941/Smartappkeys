import React from 'react';
import { Download, X, Layers, ArrowRight, Info, MapPin } from 'lucide-react';
import ElevationProfile from './ElevationProfile';

import config from '../../config';


const RouteDetails = ({ route, onClose }) => {
  if (!route) return null;
  
  // Format distance (meters to km)
  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return (meters / 1000).toFixed(1) + ' km';
  };

  // Format elevation (meters)
  const formatElevation = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    return Math.round(meters) + ' m';
  };
  
  // Difficulty indicator
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Estimate completion time based on distance and difficulty
  const estimateTime = (distance, difficulty) => {
    if (!distance) return 'N/A';
    
    // Convert distance to km if it's in meters
    const distanceKm = distance > 1000 ? distance / 1000 : distance;
    
    // Average speeds in km/h based on difficulty
    const speeds = {
      easy: 18,
      medium: 15,
      hard: 12,
      default: 15
    };
    
    const speed = speeds[difficulty] || speeds.default;
    const timeHours = distanceKm / speed;
    
    // Convert to hours and minutes
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${minutes} min`;
    }
  };
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg z-10 m-4">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-lg text-[#1f2937]">{route.name}</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-[#6b7280]" />
        </button>
      </div>
      
      <div className="p-4">
        {/* Route summary */}
        <div className="flex items-center mb-4">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getDifficultyColor(route.difficulty)}`}>
            {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <div className="text-sm text-gray-600 capitalize">
            {route.roadType || 'Mixed'} 
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <div className="text-sm text-gray-600">
            {estimateTime(route.stats?.totalDistance, route.difficulty)}
          </div>
        </div>
        
        {/* Description */}
        {route.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">{route.description}</p>
          </div>
        )}
        
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-gray-500 text-xs mb-1">Distance</div>
            <div className="font-semibold text-gray-900">
              {formatDistance(route.stats?.totalDistance * 1000 || 0)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-gray-500 text-xs mb-1">Elevation Gain</div>
            <div className="font-semibold text-gray-900">
              {formatElevation(route.stats?.elevationGain || 0)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-gray-500 text-xs mb-1">Max Elevation</div>
            <div className="font-semibold text-gray-900">
              {formatElevation(route.stats?.maxElevation || 0)}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-gray-500 text-xs mb-1">Min Elevation</div>
            <div className="font-semibold text-gray-900">
              {formatElevation(route.stats?.minElevation || 0)}
            </div>
          </div>
        </div>
        
        {/* Elevation profile */}
        {route.path && route.path.length > 0 && (
          <div className="mb-4">
            <ElevationProfile 
              routePath={route.path} 
              totalDistance={route.stats?.totalDistance * 1000 || 0} 
            />
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-2 mt-4">
          <a 
            href={config.getApiUrl(`bike-routes/${route._id}/gpx`)}
            download={`${route.name}.gpx`}
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download GPX
          </a>
          <button
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <Layers className="h-4 w-4 mr-2" />
            Show Nearby Places
          </button>
          <button
            className="flex-1 py-2 px-3 rounded-md flex items-center justify-center bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Navigate
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;