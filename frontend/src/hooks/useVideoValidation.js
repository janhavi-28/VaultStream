const DEFAULT_VIDEO_LIMITS = {
  maxSizeBytes: 2 * 1024 * 1024 * 1024,
  maxDurationSeconds: 2 * 60 * 60,
  allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
};

const readVideoMetadata = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        cleanup();
        reject(new Error('This video appears to be corrupted or unreadable.'));
        return;
      }

      resolve({
        duration: video.duration,
        objectUrl,
        video,
        cleanup,
      });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('This file could not be opened as a playable video.'));
    };

    video.src = objectUrl;
  });

const captureThumbnail = ({ video, duration, cleanup }) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      cleanup();
      reject(new Error('Thumbnail generation is not supported in this browser.'));
      return;
    }

    const seekTarget = Math.min(Math.max(duration * 0.15, 0.5), Math.max(duration - 0.25, 0));

    video.onseeked = () => {
      try {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        cleanup();
        resolve(thumbnailDataUrl);
      } catch (error) {
        cleanup();
        reject(new Error('We could not generate a thumbnail preview for this video.'));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('This video could not be decoded while generating a thumbnail.'));
    };

    video.currentTime = seekTarget;
  });

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const getDefaultVideoTitle = (fileName) => {
  if (!fileName) return 'Untitled upload';
  return fileName.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Untitled upload';
};

export const validateVideoFile = async (file, limits = DEFAULT_VIDEO_LIMITS) => {
  if (!limits.allowedMimeTypes.includes(file.type)) {
    throw new Error('Unsupported format. Use MP4, MOV, or WEBM.');
  }

  if (file.size > limits.maxSizeBytes) {
    throw new Error(`File exceeds the ${formatBytes(limits.maxSizeBytes)} limit.`);
  }

  const metadata = await readVideoMetadata(file);

  if (metadata.duration > limits.maxDurationSeconds) {
    metadata.cleanup();
    throw new Error(`Video exceeds the ${formatDuration(limits.maxDurationSeconds)} duration limit.`);
  }

  const thumbnailDataUrl = await captureThumbnail(metadata);

  return {
    file,
    duration: metadata.duration,
    thumbnailDataUrl,
    suggestedTitle: getDefaultVideoTitle(file.name),
  };
};

export const useVideoValidation = (customLimits) => {
  const limits = { ...DEFAULT_VIDEO_LIMITS, ...customLimits };

  const validateFiles = async (files) => {
    const accepted = [];
    const rejected = [];

    for (const file of files) {
      try {
        const validatedFile = await validateVideoFile(file, limits);
        accepted.push(validatedFile);
      } catch (error) {
        rejected.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          fileName: file.name,
          reason: error.message || 'This file could not be prepared for upload.',
        });
      }
    }

    return { accepted, rejected };
  };

  return {
    limits,
    validateFiles,
  };
};

export default useVideoValidation;
