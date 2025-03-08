import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    MapIcon,
    Image,
    Info,
    Mountain,
    Timer,
    Navigation2,
    ArrowUpRight,
    Maximize2
} from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PhotoSlideshow from './PhotoSlideshow';
import Header from '../pages/header';
const RouteDetail = () => {
    const { id } = useParams();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState('map');
    const [currentPosition, setCurrentPosition] = useState(null);
    const [elevationData, setElevationData] = useState([]);
    
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylineRef = useRef(null);
    const markerRef = useRef(null);

    const getTileLayer = (type) => {
        console.log('Getting tile layer for type:', type);
        return type === 'map' 
            ? L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            })
            : L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri'
            });
    };

    const displayGPXRoute = async (gpxPath) => {
        try {
            console.log('Fetching GPX from:', gpxPath);
            const response = await axios.get(`http://localhost:5000/${gpxPath}`);
            const gpxContent = response.data;
            console.log('GPX content received');

            if (polylineRef.current && mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(polylineRef.current);
                polylineRef.current = null;
            }

            const parser = new DOMParser();
            const gpxDoc = parser.parseFromString(gpxContent, "text/xml");
            const tracks = gpxDoc.getElementsByTagName('trk');
            console.log('Tracks found:', tracks.length);

            let allPoints = [];
            let elevationPoints = [];
            let totalDistance = 0;

            Array.from(tracks).forEach(track => {
                const trackPoints = Array.from(track.getElementsByTagName('trkpt'));
                
                trackPoints.forEach((trkpt, index) => {
                    const lat = parseFloat(trkpt.getAttribute('lat'));
                    const lon = parseFloat(trkpt.getAttribute('lon'));
                    const ele = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent || '0');
                    
                    allPoints.push([lat, lon]);
                    
                    if (index > 0) {
                        const prevPoint = allPoints[index - 1];
                        totalDistance += calculateDistance(
                            prevPoint[0], prevPoint[1],
                            lat, lon
                        );
                    }

                    elevationPoints.push({
                        distance: Number((totalDistance / 1609.34).toFixed(2)), // Convert to miles
                        elevation: Math.round(ele * 3.28084), // Convert to feet
                        coordinates: [lat, lon]
                    });
                });
            });

            if (allPoints.length > 0) {
                polylineRef.current = L.polyline(allPoints, {
                    color: '#4CAF50',
                    weight: 4,
                    opacity: 0.7
                }).addTo(mapInstanceRef.current);

                markerRef.current = L.marker(allPoints[0], { 
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<div class="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-md"></div>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    })
                }).addTo(mapInstanceRef.current);

                mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
                setElevationData(elevationPoints);
            }

        } catch (error) {
            console.error('Error loading GPX:', error);
            setError('Failed to load route data');
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    useEffect(() => {
        const fetchRouteDetails = async () => {
            try {
                setLoading(true);
                console.log('Fetching route:', id);
                const response = await axios.get(`http://localhost:5000/api/routes/${id}`);
                console.log('Route data:', response.data);
                setRoute(response.data);
            } catch (err) {
                console.error('Error:', err);
                setError(err.response?.data?.message || 'Failed to fetch route details');
            } finally {
                setLoading(false);
            }
        };

        fetchRouteDetails();
    }, [id]);

    useEffect(() => {
        if (!loading && route) {
            if (!mapInstanceRef.current && mapRef.current) {
                console.log('Initializing map');
                const map = L.map(mapRef.current, {
                    center: [39.8283, -98.5795],
                    zoom: 4,
                    zoomControl: false
                });

                const tileLayer = getTileLayer(viewType);
                tileLayer.addTo(map);
                
                L.control.zoom({
                    position: 'topright'
                }).addTo(map);

                mapInstanceRef.current = map;

                if (route.gpxFile?.path) {
                    console.log('Loading GPX file');
                    displayGPXRoute(route.gpxFile.path);
                }
            }
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [loading, route]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.eachLayer((layer) => {
                if (layer instanceof L.TileLayer) {
                    mapInstanceRef.current.removeLayer(layer);
                }
            });

            const tileLayer = getTileLayer(viewType);
            tileLayer.addTo(mapInstanceRef.current);
        }
    }, [viewType]);

    const handleElevationHover = (data) => {
        if (!data || !markerRef.current || !mapInstanceRef.current) return;
        const { coordinates } = data;
        setCurrentPosition(coordinates);
        markerRef.current.setLatLng(coordinates);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    if (error || !route) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600">{error || 'Route not found'}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
         <Header />
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center space-x-2 text-green-700 mb-2">
                        <Navigation2 className="w-5 h-5" />
                        <span className="font-medium">{route.city}, {route.State}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {route.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Photo Slideshow - Full Width */}
                {route.images && route.images.length > 0 ? (
    <div className="mb-8">
        <PhotoSlideshow photos={route.images} />
        {/* Debug output */}
        <div className="hidden">
            {console.log('Passing images to slideshow:', route.images)}
        </div>
    </div>
) : (
    <div className="text-gray-500 text-center py-4">
        No images available for this route
    </div>
)}
    
                {/* Quick Stats Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-gray-600">Distance</div>
                            <div className="font-semibold">{route.distance || 'N/A'} miles</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Elevation Gain</div>
                            <div className="font-semibold">{route.elevationProfile?.max || 'N/A'} ft</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Surface</div>
                            <div className="font-semibold capitalize">{route.surfaceType || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-gray-600">Difficulty</div>
                            <div className="font-semibold">Moderate</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="relative h-[500px]">
                                <div ref={mapRef} className="absolute inset-0 rounded-lg overflow-hidden" />
                                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg z-[1000]">
                                    <div className="flex border-b">
                                        <button
                                            type="button"
                                            className={`px-4 py-2 flex items-center space-x-2 rounded-tl-lg transition-colors hover:bg-gray-50 
                                                ${viewType === 'map' ? 'bg-gray-100' : ''}`}
                                            onClick={() => setViewType('map')}
                                        >
                                            <MapIcon className="w-4 h-4" />
                                            <span>Map</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-4 py-2 flex items-center space-x-2 rounded-tr-lg transition-colors hover:bg-gray-50
                                                ${viewType === 'satellite' ? 'bg-gray-100' : ''}`}
                                            onClick={() => setViewType('satellite')}
                                        >
                                            <Image className="w-4 h-4" />
                                            <span>Satellite</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">Elevation Profile</h2>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={elevationData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        onMouseMove={(e) => {
                                            if (e.activePayload) {
                                                handleElevationHover(e.activePayload[0].payload);
                                            }
                                        }}
                                    >
                                        <XAxis 
                                            dataKey="distance" 
                                            unit=" mi"
                                            stroke="#666"
                                        />
                                        <YAxis 
                                            dataKey="elevation" 
                                            unit=" ft"
                                            stroke="#666"
                                        />
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-2 border rounded shadow">
                                                            <p>Distance: {payload[0].payload.distance} mi</p>
                                                            <p>Elevation: {payload[0].payload.elevation} ft</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="elevation"
                                            stroke="#4CAF50"
                                            fill="#4CAF50"
                                            fillOpacity={0.2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-4">About This Route</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">
                                {route.description}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <button
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300"
                                onClick={() => window.open(`http://localhost:5000/${route.gpxFile?.path}`, '_blank')}
                            >
                                Download GPX
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteDetail;
