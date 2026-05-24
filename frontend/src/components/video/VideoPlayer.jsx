import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return '00:00';
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ src, poster, onVideoEnd }) => {
  const videoElement = useRef(null);
  const playerContainer = useRef(null);
  const touchStartRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('main'); // 'main' | 'speed'

  const {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoProgress,
    handleVideoSpeed,
    toggleMute,
    handleVolume,
    toggleFullscreen,
    showControlsTemporarily,
  } = useVideoPlayer(videoElement);

  const { isPlaying, progress, currentTime, duration, speed, isMuted, volume, isFullscreen, showControls } = playerState;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      switch (event.key.toLowerCase()) {
        case ' ':
        case 'k':
          event.preventDefault();
          togglePlay();
          break;
        case 'f':
          event.preventDefault();
          toggleFullscreen(playerContainer);
          break;
        case 'm':
          event.preventDefault();
          toggleMute();
          break;
        case 'arrowright':
          event.preventDefault();
          if (videoElement.current) videoElement.current.currentTime += 5;
          break;
        case 'arrowleft':
          event.preventDefault();
          if (videoElement.current) videoElement.current.currentTime -= 5;
          break;
        default:
          break;
      }
      showControlsTemporarily();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, toggleMute, togglePlay, showControlsTemporarily]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    showControlsTemporarily();
  };

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current || !videoElement.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;

    if (Math.abs(deltaY) < 40 && Math.abs(deltaX) > 60 && elapsed < 600) {
      videoElement.current.currentTime += deltaX > 0 ? 10 : -10;
      showControlsTemporarily();
    }

    touchStartRef.current = null;
  };

  return (
    <div
      ref={playerContainer}
      className={`group relative flex items-center justify-center overflow-hidden bg-black touch-pan-y ${isFullscreen ? 'h-screen w-screen' : 'w-full aspect-video rounded-xl shadow-2xl'}`}
      onMouseMove={showControlsTemporarily}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={togglePlay}
    >
      <video
        ref={videoElement}
        src={src}
        poster={poster}
        onTimeUpdate={handleOnTimeUpdate}
        onEnded={onVideoEnd}
        autoPlay
        className="h-full w-full object-contain"
        onClick={(event) => event.stopPropagation()}
      />

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-3 xs:px-4 md:px-6 md:py-4 transition-opacity duration-300 ${showControls || !isPlaying || showSettings ? 'opacity-100' : 'opacity-0'}`} onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleVideoProgress}
            className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/30 accent-indigo-500 transition-all hover:h-2"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex min-w-0 items-center gap-3 xs:gap-4 md:gap-6">
            <button onClick={togglePlay} className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-indigo-400 focus:outline-none">
              {isPlaying ? <Pause size={22} className="fill-current md:h-6 md:w-6" /> : <Play size={22} className="fill-current md:h-6 md:w-6" />}
            </button>

            <div className="group/volume flex items-center gap-2 md:gap-3">
              <button onClick={toggleMute} className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-indigo-400 focus:outline-none">
                {isMuted || volume === 0 ? <VolumeX size={18} className="md:h-5 md:w-5" /> : <Volume2 size={18} className="md:h-5 md:w-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="hidden h-1 w-16 cursor-pointer appearance-none rounded-lg bg-white/30 accent-white md:block md:w-0 md:opacity-0 md:transition-all md:duration-300 md:group-hover/volume:w-20 md:group-hover/volume:opacity-100"
              />
            </div>

            <div className="font-mono text-xs font-medium tracking-wide xs:text-sm">
              {formatTime(currentTime)} <span className="text-white/50">/</span> {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-2 xs:gap-3 md:gap-5">
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                setCurrentMenu('main');
              }}
              className={`rounded-full p-2 transition-colors hover:bg-white/10 focus:outline-none ${showSettings ? 'text-indigo-400 bg-white/10' : 'hover:text-indigo-400'}`}
            >
              <Settings size={18} className="md:h-5 md:w-5" />
            </button>
            <button onClick={() => toggleFullscreen(playerContainer)} className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-indigo-400 focus:outline-none">
              {isFullscreen ? <Minimize size={18} className="md:h-5 md:w-5" /> : <Maximize size={18} className="md:h-5 md:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div 
          className="absolute bottom-16 right-4 z-50 w-56 rounded-xl border border-white/10 bg-slate-950/95 p-3 text-white shadow-2xl backdrop-blur-md transition-all duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {currentMenu === 'main' && (
            <div className="flex flex-col gap-1 text-sm">
              <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Settings
              </div>
              <hr className="my-1 border-white/5" />
              
              <div className="flex items-center justify-between rounded-lg px-2 py-2 text-left font-medium opacity-60">
                <span>Quality</span>
                <span className="text-xs text-slate-400">Auto</span>
              </div>

              <button 
                onClick={() => setCurrentMenu('speed')}
                className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-white/10 text-left font-medium"
              >
                <span>Speed</span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  {speed === 1 ? '1x' : `${speed}x`} <ChevronRight size={14} />
                </span>
              </button>
            </div>
          )}

          {currentMenu === 'speed' && (
            <div className="flex flex-col gap-1 text-sm">
              <button 
                onClick={() => setCurrentMenu('main')}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:bg-white/5 transition-colors text-left"
              >
                <ChevronLeft size={14} /> Back to Settings
              </button>
              <hr className="my-1 border-white/5" />

              {['0.5', '1', '1.5', '2'].map((s) => {
                const speedVal = Number(s);
                const displayLabel = speedVal === 1 ? '1x (default)' : `${speedVal}x`;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      handleVideoSpeed({ target: { value: s } });
                      setShowSettings(false);
                    }}
                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-white/10 text-left font-medium"
                  >
                    <span className={speed === speedVal ? 'text-indigo-400' : ''}>{displayLabel}</span>
                    {speed === speedVal && <Check size={14} className="text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
