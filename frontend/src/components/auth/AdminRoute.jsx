// Admin Route Component
// Redirects to home if user is not admin

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  if (!isAdmin()) {
    // Redirect to home if not admin
    return <Navigate to="/home" replace />;
  }

  // Render children if authenticated and admin
  return children;
}






