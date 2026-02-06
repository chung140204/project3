// Protected Route Component
// Redirects to login if user is not authenticated

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  // Render children if authenticated
  return children;
}






