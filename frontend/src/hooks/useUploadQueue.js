import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import { useTenant } from '../context/TenantContext';
import { useNotifications } from '../context/NotificationContext';
import { formatBytes } from './useVideoValidation';
import { useSocket } from '../context/SocketContext';

const formatEta = (seconds) => {
  if (seconds === null || !Number.isFinite(seconds)) return 'Calculating...';
  if (seconds < 2) return 'Almost done';
  if (seconds < 60) return `${Math.ceil(seconds)} seconds left`;
  const mins = Math.ceil(seconds / 60);
  return `${mins} min${mins !== 1 ? 's' : ''} left`;
};

const createUploadId = () => `up_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

export const useUploadQueue = () => {
  const [queue, setQueue] = useState([]);
  const controllersRef = useRef(new Map());
  const queueRef = useRef(queue);
  const { currentTenant } = useTenant();
  const { notifyError, notifySuccess, notifyWarning } = useNotifications();

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const updateQueueItem = (id, updater) => {
    setQueue((currentQueue) =>
      currentQueue.map((item) => {
        if (item.id !== id) return item;
        return typeof updater === 'function' ? updater(item) : { ...item, ...updater };
      }),
    );
  };

  const addFiles = (validatedFiles) => {
    const nextItems = validatedFiles.map((entry) => ({
      id: createUploadId(),
      libraryId: createUploadId(),
      file: entry.file,
      title: entry.suggestedTitle,
      thumbnailDataUrl: entry.thumbnailDataUrl,
      previewUrl: URL.createObjectURL(entry.file),
      duration: entry.duration,
      tenantId: currentTenant?.id ?? 'default-tenant',
      progress: 0,
      uploadedBytes: 0,
      speedBytesPerSecond: 0,
      etaSeconds: null,
      status: 'queued',
      error: null,
      remoteUrl: null,
      addedAt: Date.now(),
    }));

    setQueue((currentQueue) => [...nextItems, ...currentQueue]);
  };

  const updateTitle = (id, title) => {
    updateQueueItem(id, { title });
  };

  const releaseQueueItem = (item) => {
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  };

  const removeFile = (id) => {
    const targetItem = queueRef.current.find((item) => item.id === id);
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);

    if (targetItem) {
      releaseQueueItem(targetItem);
    }

    setQueue((currentQueue) => currentQueue.filter((item) => item.id !== id));
  };

  const cancelUpload = async (id) => {
    const targetItem = queueRef.current.find((item) => item.id === id);
    const controller = controllersRef.current.get(id);

    if (controller) {
      controller.abort();
      controllersRef.current.delete(id);
      updateQueueItem(id, {
        status: 'canceled',
        error: 'Upload canceled by user.',
      });
      return;
    }

    if (targetItem) {
      if (targetItem.status === 'processing' && targetItem.videoId) {
        try {
          await api.delete(`/videos/${targetItem.videoId}`);
        } catch (err) {
          console.warn('Failed to delete video on cancel during processing', err);
        }
      }
      updateQueueItem(id, {
        status: 'canceled',
        error: 'Upload canceled by user.',
      });
    }
  };

  const retryUpload = (id) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    updateQueueItem(id, (item) => ({
      ...item,
      progress: 0,
      uploadedBytes: 0,
      speedBytesPerSecond: 0,
      etaSeconds: null,
      status: 'queued',
      error: null,
      remoteUrl: null,
      addedAt: Date.now(),
    }));
  };

  const clearCompleted = () => {
    const completedItems = queueRef.current.filter((item) => item.status === 'completed');
    completedItems.forEach(releaseQueueItem);
    setQueue((currentQueue) => currentQueue.filter((item) => item.status !== 'completed'));
  };

  useEffect(() => {
    const activeItem = queue.find((item) => item.status === 'uploading' || item.status === 'processing');
    if (activeItem) return;

    const nextQueuedItem = queue.find((item) => item.status === 'queued');
    if (!nextQueuedItem) return;

    const controller = new AbortController();
    controllersRef.current.set(nextQueuedItem.id, controller);

    updateQueueItem(nextQueuedItem.id, {
      status: 'uploading',
      error: null,
    });

    const startTime = performance.now();

    const formData = new FormData();
    formData.append('video', nextQueuedItem.file);
    formData.append('title', nextQueuedItem.title || '');

    api
      .post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
        onUploadProgress: (event) => {
          const total = event.total || nextQueuedItem.file.size;
          const loaded = Math.min(event.loaded || 0, total);
          const elapsedSeconds = Math.max((performance.now() - startTime) / 1000, 0.1);
          const speed = loaded / elapsedSeconds;
          const eta = total > loaded ? (total - loaded) / Math.max(speed, 1) : 0;

          updateQueueItem(nextQueuedItem.id, {
            progress: total ? Math.round((loaded / total) * 100) : 0,
            uploadedBytes: loaded,
            speedBytesPerSecond: speed,
            etaSeconds: eta,
          });
        },
      })
      .then((response) => {
        controllersRef.current.delete(nextQueuedItem.id);
        updateQueueItem(nextQueuedItem.id, {
          progress: 0,
          uploadedBytes: nextQueuedItem.file.size,
          speedBytesPerSecond: nextQueuedItem.file.size / Math.max((performance.now() - startTime) / 1000, 1),
          etaSeconds: 0,
          status: 'processing',
          remoteUrl: response.data?.video?.url || null,
          videoId: response.data?.video?._id || null,
        });

        notifySuccess('Upload successful', `${nextQueuedItem.title} was successfully uploaded and is now being analyzed.`, false);
      })
      .catch((error) => {
        controllersRef.current.delete(nextQueuedItem.id);
        if (
          error.code === 'ERR_CANCELED' ||
          error.name === 'CanceledError' ||
          error.message === 'canceled' ||
          (error.message && error.message.toLowerCase().includes('cancel'))
        ) {
          updateQueueItem(nextQueuedItem.id, {
            status: 'canceled',
            error: 'Upload canceled by user.',
          });
          notifyWarning('Upload canceled', `${nextQueuedItem.title} was canceled.`, false);
          return;
        }

        updateQueueItem(nextQueuedItem.id, {
          status: 'failed',
          error: error.message || 'Upload failed before the server accepted the file.',
        });
        notifyError('Processing failed', error.message || `${nextQueuedItem.title} could not be uploaded.`, true);
      });
  }, [currentTenant, queue]);

  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleProcessingCompleted = (data) => {
      const targetItem = queueRef.current.find((item) => item.videoId === data.videoId || (item.title && data.title && item.title === data.title));

      setQueue((currentQueue) =>
        currentQueue.map((item) => {
          if (item.videoId === data.videoId || (item.title && data.title && item.title === data.title)) {
            return {
              ...item,
              status: 'completed',
              sensitivity: data.sensitivity,
              error: null,
            };
          }
          return item;
        })
      );

      if (targetItem) {
        setTimeout(() => {
          removeFile(targetItem.id);
        }, 6000);
      }
    };

    const handleProcessingFailed = (data) => {
      setQueue((currentQueue) =>
        currentQueue.map((item) => {
          if (item.videoId === data.videoId || (item.title && data.title && item.title === data.title)) {
            return {
              ...item,
              status: 'failed',
              error: data.error || 'Processing failed',
            };
          }
          return item;
        })
      );
    };

    const handleProcessingProgress = (data) => {
      setQueue((currentQueue) =>
        currentQueue.map((item) => {
          if (item.videoId === data.videoId || (item.title && data.title && item.title === data.title)) {
            return {
              ...item,
              progress: data.percent,
            };
          }
          return item;
        })
      );
    };

    socket.on('processing-completed', handleProcessingCompleted);
    socket.on('processing-failed', handleProcessingFailed);
    socket.on('processing-progress', handleProcessingProgress);

    return () => {
      socket.off('processing-completed', handleProcessingCompleted);
      socket.off('processing-failed', handleProcessingFailed);
      socket.off('processing-progress', handleProcessingProgress);
    };
  }, [socket]);

  // Clean up aborted controllers when the queue hook unmounts
  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort());
      queueRef.current.forEach(releaseQueueItem);
    };
  }, []);

  const stats = useMemo(() => {
    const queued = queue.filter((item) => item.status === 'queued').length;
    const uploading = queue.filter((item) => item.status === 'uploading').length;
    const completed = queue.filter((item) => item.status === 'completed').length;
    const failed = queue.filter((item) => item.status === 'failed').length;
    const totalBytes = queue.reduce((sum, item) => sum + item.file.size, 0);

    return {
      queued,
      uploading,
      completed,
      failed,
      totalBytes,
      totalLabel: formatBytes(totalBytes),
    };
  }, [queue]);

  const decoratedQueue = useMemo(
    () =>
      queue.map((item) => ({
        ...item,
        etaLabel:
          item.status === 'processing'
            ? 'Finalizing upload'
            : item.status === 'completed'
              ? 'Ready in library'
              : formatEta(item.etaSeconds),
      })),
    [queue],
  );

  return {
    queue: decoratedQueue,
    stats,
    addFiles,
    updateTitle,
    cancelUpload,
    retryUpload,
    removeFile,
    clearCompleted,
  };
};

export default useUploadQueue;
