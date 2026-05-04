import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // If no user in route state, redirect back to login
  if (!location.state?.user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
