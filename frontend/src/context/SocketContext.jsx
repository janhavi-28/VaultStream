import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const SocketContext = createContext();

export const STAGES = [
  'Uploading',
  'Validating',
  'Compressing',
  'Sensitivity Analysis',
  'Thumbnail Generation',
  'Streaming Optimization',
  'Completed'
];

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { notifyError, notifySuccess, notifyWarning, push, fetchNotifications } = useNotifications();
  const { user, setAuthData } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [queue, setQueue] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  
  // Toggle simulation mode
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    // In production (Vercel): socket connects to the same domain (same-origin)
    // In dev: connect to localhost:5000
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');

    const backendUrl = isLocalhost
      ? (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
      : window.location.origin;

    const newSocket = io(backendUrl, {
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      notifySuccess('System alert', 'Realtime connection restored.', false);
      if (user?.id) {
        newSocket.emit('join-user-room', user.id);
      }
    });
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      notifyWarning('System alert', 'Realtime connection lost. Updates may be delayed.', true);
    });

    // Handle real events if they come in
    newSocket.on('processing-started', (data) => handleProcessingStarted(data));
    newSocket.on('processing-progress', (data) => handleProcessingProgress(data));
    newSocket.on('processing-completed', (data) => handleProcessingCompleted(data));
    newSocket.on('processing-failed', (data) => handleProcessingFailed(data));
    newSocket.on('new-notification', async (data) => {
      // Add the incoming notification to the bell dropdown (sticky = goes to bell only, no floating toast)
      push({...data, id: data._id, sticky: true});

      // Also re-fetch all notifications from DB to stay in sync
      fetchNotifications();

      // If this is a role approval, re-fetch the user profile so UI updates
      if (data.title?.includes('Granted') || data.title?.includes('Access')) {
        try {
          const { data: profileData } = await api.get('/auth/me');
          if (profileData?.user && setAuthData) {
            const freshToken = localStorage.getItem('token');
            setAuthData(profileData.user, freshToken);
          }
        } catch (e) {
          console.warn('Could not refresh profile after role change', e);
        }
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [notifySuccess, notifyWarning, push]);

  // Join user-specific room whenever user.id becomes available (handles post-login state)
  useEffect(() => {
    if (socket && user?.id && socket.connected) {
      socket.emit('join-user-room', user.id);
    }
  }, [socket, user?.id]);

  // Utility to add to activity feed
  const logActivity = useCallback((type, message, videoId) => {
    setActivityFeed(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      message,
      videoId
    }, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  // Event Handlers
  const handleProcessingStarted = useCallback((data) => {
    setQueue(prev => {
      const matchId = data.id || data.videoId;
      if (prev.find(v => (v.id === matchId || v.videoId === matchId))) return prev;
      return [...prev, { ...data, id: matchId, videoId: matchId, stage: 0, progress: 0, status: 'processing' }];
    });
    logActivity('info', `Started processing: ${data.title}`, data.id || data.videoId);
  }, [logActivity]);

  const handleProcessingProgress = useCallback((data) => {
    setQueue(prev => prev.map(video => {
      const matchId = data.id || data.videoId;
      if (video.id === matchId || video.videoId === matchId) {
        return { 
          ...video, 
          stage: data.stage !== undefined ? data.stage : video.stage, 
          progress: data.progress !== undefined ? data.progress : (data.percent !== undefined ? data.percent : video.progress), 
          status: 'processing' 
        };
      }
      return video;
    }));
    // Only log stage changes to avoid spam
    if (data.progress === 0 || data.progress === 100 || data.percent === 0 || data.percent === 100) {
      logActivity('progress', `Advanced to stage: ${STAGES[data.stage !== undefined ? data.stage : 3]}`, data.id || data.videoId);
    }
  }, [logActivity]);

  const handleProcessingCompleted = useCallback((data) => {
    setQueue(prev => prev.map(video => {
      const matchId = data.id || data.videoId;
      return (video.id === matchId || video.videoId === matchId)
        ? { ...video, stage: 6, progress: 100, status: 'completed' } 
        : video;
    }));
    logActivity('success', `Completed processing: ${data.title || data.id || data.videoId}`, data.id || data.videoId);
    notifySuccess('Upload completed', `${data.title || data.id || data.videoId} finished processing and is ready.`, false);
  }, [logActivity, notifySuccess]);

  const handleProcessingFailed = useCallback((data) => {
    setQueue(prev => prev.map(video => {
      const matchId = data.id || data.videoId;
      return (video.id === matchId || video.videoId === matchId)
        ? { ...video, status: 'failed', error: data.error } 
        : video;
    }));
    logActivity('error', `Failed at stage ${STAGES[data.stage !== undefined ? data.stage : 0]}: ${data.error}`, data.id || data.videoId);
    notifyError('Processing failed', `${data.error}`, true);
  }, [logActivity, notifyError]);

  const retryProcessing = useCallback((id) => {
    // In a real app, emit to backend: socket.emit('retry_processing', { id })
    logActivity('warning', `Retrying processing...`, id);
    setQueue(prev => prev.map(video => 
      video.id === id 
        ? { ...video, status: 'processing', error: null, stage: 0, progress: 0 } 
        : video
    ));
    notifyWarning('Retry started', `Processing retry launched for ${id}.`, false);
  }, [logActivity, notifyWarning]);

  // Simulation Mode Logic
  useEffect(() => {
    if (!isSimulating) return;

    // Seed initial videos
    if (queue.length === 0) {
      handleProcessingStarted({ id: 'vid-1', title: 'Q3 All Hands.mp4' });
      setTimeout(() => handleProcessingStarted({ id: 'vid-2', title: 'Onboarding.mp4' }), 3000);
    }

    const interval = setInterval(() => {
      setQueue(currentQueue => {
        currentQueue.forEach(video => {
          if (video.status === 'processing' && video.stage < 6) {
            // Randomly advance progress
            let newProgress = video.progress + Math.floor(Math.random() * 15) + 5;
            let newStage = video.stage;
            
            // Randomly fail sometimes in compression or sensitivity
            if (Math.random() < 0.05 && (newStage === 2 || newStage === 3) && video.status !== 'failed') {
              handleProcessingFailed({ id: video.id, stage: newStage, error: 'Codec mismatch detected.' });
              return;
            }

            if (newProgress >= 100) {
              if (newStage === 5) {
                // Done!
                handleProcessingCompleted({ id: video.id, title: video.title });
              } else {
                // Next stage
                handleProcessingProgress({ id: video.id, stage: newStage + 1, progress: 0 });
              }
            } else {
              handleProcessingProgress({ id: video.id, stage: newStage, progress: newProgress });
            }
          }
        });
        return currentQueue;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating, queue.length, handleProcessingCompleted, handleProcessingFailed, handleProcessingProgress, handleProcessingStarted]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      queue,
      activityFeed,
      retryProcessing,
      isSimulating,
      setIsSimulating
    }}>
      {children}
    </SocketContext.Provider>
  );
};
