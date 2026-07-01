import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const DashboardRouter = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/auth" replace />;

  if (user.role === 'Admin') return <Navigate to="/dashboard/admin" replace />;
  if (user.role === 'Organizer') return <Navigate to="/dashboard/organizer" replace />;
  
  return <Navigate to="/dashboard/attendee" replace />;
};

export default DashboardRouter;
