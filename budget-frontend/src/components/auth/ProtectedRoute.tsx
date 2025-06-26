import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Simple token check for now - we'll enhance this with proper auth hook later
  const token = Cookies.get('access_token');
  const isAuthenticated = !!token;

  // For now, just check if token exists
  // In a real app, you'd validate the token and check expiration
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};