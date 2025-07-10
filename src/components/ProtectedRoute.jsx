// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  return children; // User is logged in, render the component
};

export default ProtectedRoute;