import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-lg text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Capture the current path + query params
    const fullPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${fullPath}`} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;