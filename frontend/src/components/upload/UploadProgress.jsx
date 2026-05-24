import React from 'react';

const UploadProgress = ({ progress, status }) => {
  const barColor =
    status === 'failed'
      ? 'bg-rose-500'
      : status === 'completed'
        ? 'bg-emerald-500'
        : status === 'processing'
          ? 'bg-amber-500'
          : 'bg-sky-500';

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{status === 'processing' ? `${progress}% processed` : `${progress}% uploaded`}</span>
        <span>{status === 'processing' ? 'Processing asset' : 'Transfer progress'}</span>
      </div>
    </div>
  );
};

export default UploadProgress;
