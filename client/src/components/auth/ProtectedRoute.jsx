import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
