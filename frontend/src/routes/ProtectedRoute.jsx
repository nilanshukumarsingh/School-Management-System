import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/common/Skeleton';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
            🎓
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading ScholaVerse Session...</p>
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
