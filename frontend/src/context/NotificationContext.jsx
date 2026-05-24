import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const createNotificationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const response = await axios.get('/notifications');
      if (response.data?.success) {
        const backendNotes = response.data.notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          sticky: true,
          createdAt: n.createdAt,
          read: n.read,
        }));
        setNotifications(backendNotes);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Re-fetch when the tab regains focus (catches missed socket events)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchNotifications]);

  const push = useCallback(({ id: existingId, title, message, type = 'info', sticky = false, createdAt: existingCreatedAt, read = false }) => {
    const id = existingId || createNotificationId();
    const createdAt = existingCreatedAt || new Date().toISOString();
    setNotifications((current) => [{ id, title, message, type, sticky, createdAt, read }, ...current].slice(0, 50));
    if (!sticky) {
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== id));
      }, 4500);
    }
    return id;
  }, []);

  const remove = useCallback(async (id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
    // If it's a backend ID (Mongo ObjectId length is 24)
    if (id && id.length === 24) {
      try {
        await axios.delete(`/notifications/${id}`);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    try {
      if (localStorage.getItem('token')) {
        await axios.put('/notifications/read');
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications((current) => current.filter(n => !n.sticky || n.id.length !== 24)); // Clear backend ones
    try {
      if (localStorage.getItem('token')) {
        await axios.delete('/notifications');
      }
    } catch (err) {
      console.error(err);
    }
  }, []);
  const notifySuccess = useCallback((title, message, sticky) => push({ title, message, type: 'success', sticky }), [push]);
  const notifyError = useCallback((title, message, sticky = true) => push({ title, message, type: 'error', sticky }), [push]);
  const notifyWarning = useCallback((title, message, sticky = true) => push({ title, message, type: 'warning', sticky }), [push]);
  const notifyInfo = useCallback((title, message, sticky) => push({ title, message, type: 'info', sticky }), [push]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      notifySuccess,
      notifyError,
      notifyWarning,
      notifyInfo,
      push,
      remove,
      markAllRead,
      clearAll,
      fetchNotifications,
    }),
    [clearAll, fetchNotifications, markAllRead, notifications, notifyError, notifyInfo, notifySuccess, notifyWarning, push, remove],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
