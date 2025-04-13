import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Image, Save, Eye } from 'lucide-react';
import axios from 'axios';
//import Header from '../pages/header';
import config from '../config';

const RouteUploadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    State: '',
    description: '',
    gpxFile: null,
    images: [],
    surfaceType: 'paved',
    distance: '',
    elevationProfile: {
        data: [],
        min: null,
        max: null
    }
});
      const [isLoading, setIsLoading] = useState(false);
      const [viewType, setViewType] = useState('map');
      const [previewMode, setPreviewMode] = useState(false);
      const [gpxPreview, setGpxPreview] = useState(null);
      
      const mapRef = useRef(null);
      const mapInstanceRef = useRef(null);
      const polylineRef = useRef(null);
      const surfaceTypes = [
        { value: 'paved', label: 'Paved' },
        { value: 'unpaved', label: 'Unpaved' },
        { value: 'mixed', label: 'Mixed' }
    ];

    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 
        'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 
        'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 
        'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 
        'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 
        'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 
        'West Virginia', 'Wisconsin', 'Wyoming'
    ];
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleFileChange = async (e) => {
        const { name, files } = e.target;
        if (name === 'gpxFile') {
            const file = files[0];
            setFormData(prev => ({ ...prev, gpxFile: file }));
           // Read the GPX file
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('GPX file loaded:', e.target.result); // Debug log
            setGpxPreview(e.target.result);
        };
        reader.readAsText(file);
        } else if (name === 'images') {
            console.log('Files selected:', files); // Debug log
            const imageFiles = Array.from(files);
            
            try {
                // Convert HEIC to PNG if needed
                const processedFiles = await Promise.all(
                    imageFiles.map(async (file) => {
                        console.log('Processing file:', file.name); // Debug log
                        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                            const response = await fetch(config.getApiUrl('convert-heic'), {
                                method: 'POST',
                                body: file
                            });
                            const blob = await response.blob();
                            return new File([blob], file.name.replace(/\.heic$/i, '.png'), { type: 'image/png' });
                        }
                        return file;
                    })
                );
                
                console.log('Processed files:', processedFiles); // Debug log
                setFormData(prev => ({ ...prev, images: processedFiles }));
            } catch (error) {
                console.error('Error processing images:', error);
                alert('Error processing images. Please try again.');
            }
        }
    };

  const clearMap = () => {
    if (polylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
  };

  
  useEffect(() => {
    if (previewMode && !mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
        zoomControl: false
      });

      const tileLayer = viewType === 'map' 
        ? L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          })
        : L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
          });
      
      tileLayer.addTo(map);
      mapInstanceRef.current = map;

      L.control.zoom({
        position: 'topright'
      }).addTo(map);
    }

    if (mapInstanceRef.current && gpxPreview) {
      clearMap();
      
      try {
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(gpxPreview, "text/xml");
        const tracks = gpxDoc.getElementsByTagName('trk');
        
        let allPoints = [];
        Array.from(tracks).forEach(track => {
          const points = Array.from(track.getElementsByTagName('trkpt')).map(trkpt => [
            parseFloat(trkpt.getAttribute('lat')),
            parseFloat(trkpt.getAttribute('lon'))
          ]);
          allPoints = allPoints.concat(points);
          
          polylineRef.current = L.polyline(points, {
            color: 'red',
            weight: 3,
            opacity: 0.7
          }).addTo(mapInstanceRef.current);
        });

        if (allPoints.length > 0) {
          mapInstanceRef.current.fitBounds(allPoints);
        }
      } catch (error) {
        console.error('Error parsing GPX:', error);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [previewMode, viewType, gpxPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gpxFile) {
        alert('Please select a GPX file');
        return;
    }
    
    try {
        setIsLoading(true);
        const formDataToSend = new FormData();
        
        // Add basic fields
        formDataToSend.append('name', formData.name);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('State', formData.State);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('surfaceType', formData.surfaceType);
        formDataToSend.append('distance', formData.distance);
        
        // Add GPX file
        formDataToSend.append('gpxFile', formData.gpxFile);
        
        // Add images
        if (formData.images && formData.images.length > 0) {
            console.log('Appending images:', formData.images); // Debug log
            formData.images.forEach((image, index) => {
                formDataToSend.append(`images`, image);
                console.log(`Appending image ${index}:`, image.name); // Debug log
            });
        }
        
        console.log('FormData content:'); // Debug log
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await axios.post(config.getApiUrl('routes'), formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            console.log('Server response:', response.data); // Debug log
            alert('Route saved successfully!');
            setFormData({
                name: '',
                city: '',
                State: '',
                description: '',
                gpxFile: null,
                images: [],
                surfaceType: 'paved',
                distance: '',
                elevationProfile: {
                    data: [],
                    min: null,
                    max: null
                }
            });
        } else {
            throw new Error(response.data.error);
        }
    } catch (error) {
        console.error('Error saving route:', error);
        alert('Error saving route: ' + error.message);
    } finally {
        setIsLoading(false);
    }
};

  

  return (
    <div className="min-h-screen bg-gray-50">
    <Header/>
    <div className="container mx-auto p-6 max-w-4xl">
    
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Route Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                                placeholder="e.g., Boulder, Denver, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <select
                                name="State"
                                value={formData.State}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select a state</option>
                                {states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded h-32"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Surface Type</label>
                            <select
                                name="surfaceType"
                                value={formData.surfaceType}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                {surfaceTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Distance (miles)</label>
                            <input
                                type="number"
                                name="distance"
                                value={formData.distance}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                                min="0"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">GPX File</label>
                        <input
                            type="file"
                            name="gpxFile"
                            accept=".gpx"
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Route Images</label>
                        <input
                            type="file"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="w-full p-2 border rounded"
                        />
                        <p className="text-sm text-gray-500 mt-1">Supports PNG and HEIC formats</p>
                    </div>
                </div>

                {formData.images.length > 0 && (
    <div className="mt-2 grid grid-cols-6 gap-2">
        {formData.images.map((image, index) => (
            <div key={index} className="relative aspect-square">
                <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                />
            </div>
        ))}
    </div>
)}

                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setPreviewMode(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex items-center px-4 py-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>

                    {/* Map Preview Section */}
                    {previewMode && (
                        <div className="relative h-96">
                            <div ref={mapRef} className="absolute inset-0 rounded-lg overflow-hidden" />
                            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg z-[1000]">
                                <div className="flex border-b">
                                    <button 
                                        type="button"
                                        className={`px-4 py-2 flex items-center space-x-2 rounded-tl-lg transition-colors hover:bg-gray-50 
                                            ${viewType === 'map' ? 'bg-gray-100' : ''}`}
                                        onClick={() => setViewType('map')}
                                    >
                                        <Map className="w-4 h-4" />
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
                    )}
                </div>
            </form>
        </div>
    </div>
    );
};
export default RouteUploadForm;
