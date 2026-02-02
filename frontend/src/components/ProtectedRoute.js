import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/get-started" replace />;
  }

  return children;
};

export default ProtectedRoute;
