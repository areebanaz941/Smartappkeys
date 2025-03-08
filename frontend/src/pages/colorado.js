import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ColoradoRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                // Add error handling for the request
                const response = await axios.get('http://localhost:5000/api/routes', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 second timeout
                });

                if (!response.data) {
                    throw new Error('No data received from server');
                }

                // Filter routes for Colorado
                const coloradoRoutes = response.data.filter(route => route.State === 'Colorado');
                setRoutes(coloradoRoutes);
                setLoading(false);
            } catch (err) {
                console.error('Error details:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch routes');
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []);

    const handleRouteClick = (routeId) => {
        if (!routeId) return;
        navigate(`/route/${routeId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center">
                        <div className="text-red-600 mb-4">
                            {error}
                        </div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-green-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Best Bike Rides in Colorado
                    </h1>
                    <p className="text-xl opacity-90">
                        Explore the Rocky Mountains' most scenic cycling routes
                    </p>
                </div>
            </div>

            {/* Routes List */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="space-y-6">
                    {routes.length === 0 ? (
                        <div className="text-center text-gray-600 py-12">
                            No routes found for Colorado
                        </div>
                    ) : (
                        routes.map((route) => (
                            <div
                                key={route._id}
                                onClick={() => handleRouteClick(route._id)}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="p-6">
                                    <div className="flex items-center space-x-2 text-green-700 mb-2">
                                        <MapPin className="w-5 h-5" />
                                        <span className="font-medium">{route.city}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                {route.name}
                                            </h2>
                                            <p className="text-gray-600 line-clamp-2">
                                                {route.description}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                                    </div>

                                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                                        {route.distance && (
                                            <span className="flex items-center">
                                                <Navigation className="w-4 h-4 mr-1" />
                                                {route.distance} miles
                                            </span>
                                        )}
                                        {route.surfaceType && (
                                            <span className="capitalize">
                                                {route.surfaceType} surface
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ColoradoRoutes;
