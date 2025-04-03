// src/utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://smartappkeys-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getRoutes = () => API.get('/routes');
export const createRoute = (formData) => {
  return API.post('/routes', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
