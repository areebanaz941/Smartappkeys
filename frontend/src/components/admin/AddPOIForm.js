// src/components/admin/AddPOIForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddPOIForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  // Form state with new category field
  const [formData, setFormData] = useState({
    category: '',      // New master category field
    type_it: '',
    type_en: '',
    coordinates: '',
    photo: '',
    name_en: '',
    description_en: '',
    name_it: '',
    description_it: ''
  });

  // Auto-hide notification when it's visible
  useEffect(() => {
    let timer;
    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showNotification]);

  // POI categories with mapping to localized display types
  const poiCategories = [
    { category: 'business', it: 'Azienda', en: 'Business' },
    { category: 'cultural', it: 'Culturale', en: 'Cultural' },
    { category: 'landscape', it: 'Culturale/paesaggistico', en: 'Landscape' },
    { category: 'religious', it: 'Culturale/religioso', en: 'Religious' },
    { category: 'landscape_religious', it: 'Paesaggistico/religioso', en: 'Landscape/Religious' },
  ];

  // Handle category selection
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    const selectedTypeInfo = poiCategories.find(item => item.category === selectedCategory);
    
    setFormData({
      ...formData,
      category: selectedCategory,
      type_it: selectedTypeInfo ? selectedTypeInfo.it : '',
      type_en: selectedTypeInfo ? selectedTypeInfo.en : ''
    });
  };

  // Handle other input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setShowNotification(false);

    try {
      // Log form data for debugging
      console.log('Form data being submitted:', formData);

      // Extract lat and lng from coordinates string for validation
      let coordinates = formData.coordinates.split(',').map(coord => coord.trim());
      
      // Basic validation
      if (coordinates.length !== 2 || isNaN(parseFloat(coordinates[0])) || isNaN(parseFloat(coordinates[1]))) {
        throw new Error('Coordinates must be in format: latitude, longitude');
      }

      // Create POI object with new category field
      const poiData = {
        category: formData.category,
        type_it: formData.type_it,
        type_en: formData.type_en,
        coordinates: {
          lat: parseFloat(coordinates[0]),
          lng: parseFloat(coordinates[1])
        },
        photo: formData.photo,
        name_en: formData.name_en,
        description_en: formData.description_en,
        name_it: formData.name_it,
        description_it: formData.description_it
      };

      // Log the final request payload
      console.log('POI data being sent to API:', poiData);
      
      // Log the full request URL
      // Use the absolute URL with the correct port:
      const apiUrl = 'http://localhost:5000/api/pois';
      console.log('API endpoint:', apiUrl, 'with method: POST');

      // Send to backend with more detailed logging
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(poiData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

      // Handle response with better error handling
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Response parsing error:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save POI');
      }

      // Set success message and show notification
      setSuccessMessage(`"${formData.name_en}" added successfully!`);
      setShowNotification(true);
      
      // Reset form
      setFormData({
        category: '',
        type_it: '',
        type_en: '',
        coordinates: '',
        photo: '',
        name_en: '',
        description_en: '',
        name_it: '',
        description_it: ''
      });
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error saving POI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">Add New Point of Interest</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Floating success notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
          <button 
            onClick={() => setShowNotification(false)}
            className="ml-2 text-white hover:text-gray-200"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Selection (new field) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            >
              <option value="">Select Category</option>
              {poiCategories.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category.charAt(0).toUpperCase() + cat.category.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Internal classification used for grouping POIs</p>
          </div>
          
          {/* Display Types (now auto-filled based on category) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type (Italian)
            </label>
            <input
              type="text"
              name="type_it"
              value={formData.type_it}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen bg-gray-50"
              readOnly
              required
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from category selection</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type (English)
            </label>
            <input
              type="text"
              name="type_en"
              value={formData.type_en}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen bg-gray-50"
              readOnly
              required
            />
            <p className="text-xs text-gray-500 mt-1">Auto-filled from category selection</p>
          </div>
          
          {/* Coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coordinates (latitude, longitude)
            </label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates}
              onChange={handleChange}
              placeholder="42.6851326966809, 11.907076835632326"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: latitude, longitude</p>
          </div>
          
          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
            />
          </div>
          
          {/* English Name & Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English)
            </label>
            <input
              type="text"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              placeholder="POI Name in English"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Italian)
            </label>
            <input
              type="text"
              name="name_it"
              value={formData.name_it}
              onChange={handleChange}
              placeholder="POI Name in Italian"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              rows={4}
              placeholder="Enter description in English"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Italian)
            </label>
            <textarea
              name="description_it"
              value={formData.description_it}
              onChange={handleChange}
              rows={4}
              placeholder="Enter description in Italian"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellowgreen"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-yellowgreen text-white rounded-md hover:bg-[#6aaf1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellowgreen"
          >
            {isLoading ? 'Saving...' : 'Save POI'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPOIForm;