import React from 'react';

const RealtimeProgressBar = ({ progress, status }) => {
  // Determine color based on status
  let barColor = 'bg-indigo-500';
  let glowColor = 'shadow-indigo-500/50';

  if (status === 'completed') {
    barColor = 'bg-green-500';
    glowColor = 'shadow-green-500/50';
  } else if (status === 'failed') {
    barColor = 'bg-red-500';
    glowColor = 'shadow-red-500/50';
  }

  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`h-2.5 rounded-full transition-all duration-1000 ease-out relative ${barColor}`}
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      >
        {status === 'processing' && (
          <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden rounded-full">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeProgressBar;
