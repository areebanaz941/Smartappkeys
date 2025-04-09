import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  // Check if token exists in localStorage
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;