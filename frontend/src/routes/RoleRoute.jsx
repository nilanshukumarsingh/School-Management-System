import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to permitted dashboard based on actual role
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (user?.role === 'GUARDIAN') return <Navigate to="/guardian/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};
