import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RoleName } from '../../hooks/usePermissions';
import Unauthorized from '../../pages/Unauthorized';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si se especificaron roles permitidos
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role as RoleName;
    if (!allowedRoles.includes(userRole)) {
      return <Unauthorized />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
