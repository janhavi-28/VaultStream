import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const RoleGuard = ({ allowedRoles }) => {
  const { role, loading } = useAuth();
  const { notifyWarning } = useNotifications();
  const location = useLocation();
  const isAllowed = allowedRoles.includes(role);

  useEffect(() => {
    if (!loading && !isAllowed) {
      notifyWarning('Unauthorized action', 'You do not have permission to access that area.', false);
    }
  }, [isAllowed, loading, notifyWarning, location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B1120]"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
