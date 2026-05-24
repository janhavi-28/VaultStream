import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { notifyWarning, notifySuccess } = useNotifications();

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      notifyWarning('No internet connection', 'You are offline. Some actions may be delayed.', true);
    };
    const handleOnline = () => {
      setIsOffline(false);
      notifySuccess('Connection restored', 'You are back online.', false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [notifySuccess, notifyWarning]);

  if (!isOffline) return null;

  return (
    <div className="sticky top-0 z-[70] border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <WifiOff size={16} />
        No internet connection. Your changes may not sync until you reconnect.
      </div>
    </div>
  );
};

export default OfflineBanner;
