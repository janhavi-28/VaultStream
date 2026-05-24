import React from 'react';
import { useAuth } from '../../context/AuthContext';

const CanAccess = ({ permission, children, fallback = null }) => {
  const { hasPermission } = useAuth();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return fallback;
};

export default CanAccess;
