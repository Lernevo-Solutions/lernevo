import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, featureName = 'this feature' }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const isAuthenticated =
    token && token !== 'undefined' && token !== 'null' && token.trim() !== '';

  useEffect(() => {
    if (!isAuthenticated) {
      window.alert(`Please signup or login to access ${featureName}.`);
    }
  }, [featureName, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/get-started?mode=login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
