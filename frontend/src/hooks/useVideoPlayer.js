import { useState, useEffect, useRef, useCallback } from 'react';

export const useVideoPlayer = (videoElement) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: true, // Auto-play by default
    progress: 0,
    speed: 1,
    isMuted: false,
    volume: 1,
    duration: 0,
    currentTime: 0,
    isFullscreen: false,
    showControls: true
  });

  const controlsTimeoutRef = useRef(null);

  const togglePlay = useCallback(() => {
    setPlayerState(prev => {
      const isPlaying = !prev.isPlaying;
      if (videoElement.current) {
        isPlaying ? videoElement.current.play() : videoElement.current.pause();
      }
      return { ...prev, isPlaying };
    });
  }, [videoElement]);

  const handleOnTimeUpdate = () => {
    if (!videoElement.current) return;
    const progress = (videoElement.current.currentTime / videoElement.current.duration) * 100;
    setPlayerState(prev => ({
      ...prev,
      progress,
      currentTime: videoElement.current.currentTime,
      duration: videoElement.current.duration
    }));
  };

  const handleVideoProgress = (event) => {
    if (!videoElement.current) return;
    const manualChange = Number(event.target.value);
    videoElement.current.currentTime = (videoElement.current.duration / 100) * manualChange;
    setPlayerState(prev => ({ ...prev, progress: manualChange }));
  };

  const handleVideoSpeed = (event) => {
    if (!videoElement.current) return;
    const speed = Number(event.target.value);
    videoElement.current.playbackRate = speed;
    setPlayerState(prev => ({ ...prev, speed }));
  };

  const toggleMute = () => {
    setPlayerState(prev => {
      const isMuted = !prev.isMuted;
      if (videoElement.current) {
        videoElement.current.muted = isMuted;
      }
      return { ...prev, isMuted };
    });
  };

  const handleVolume = (event) => {
    if (!videoElement.current) return;
    const volume = Number(event.target.value);
    videoElement.current.volume = volume;
    setPlayerState(prev => ({
      ...prev,
      volume,
      isMuted: volume === 0
    }));
  };

  const toggleFullscreen = async (containerRef) => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setPlayerState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setPlayerState(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const showControlsTemporarily = useCallback(() => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.isPlaying) {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  }, [playerState.isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoProgress,
    handleVideoSpeed,
    toggleMute,
    handleVolume,
    toggleFullscreen,
    showControlsTemporarily
  };
};
