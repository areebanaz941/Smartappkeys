// src/config/api.js
const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'https://smartappkeys.onrender.com',
    ENDPOINTS: {
      ROUTES: '/api/routes',
      UPLOAD: '/api/routes',
      IMAGES: '/uploads'
    },
    DEFAULTS: {
      TIMEOUT: 30000,
      HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  };
  
  // API utility functions
  export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
  export const getImageUrl = (path) => `${API_CONFIG.BASE_URL}/${path}`;
  export const getUploadUrl = () => getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD);
  
  // Error handling utility
  export const handleApiError = (error) => {
    console.error('API Error:', error);
    return {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status
    };
  };
  
  export default API_CONFIG;
