import React from 'react';
import { useSocket, STAGES } from '../../../context/SocketContext';
import RealtimeProgressBar from './RealtimeProgressBar';
import ProcessingTimeline from './ProcessingTimeline';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';

const VideoStatusCard = ({ video }) => {
  const { retryProcessing } = useSocket();

  const isFailed = video.status === 'failed';
  const isCompleted = video.status === 'completed';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
      {/* Background glow effects */}
      {video.status === 'processing' && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
      )}
      {isFailed && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isFailed ? 'bg-red-500/10 text-red-500' : isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Film size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-xs">{video.title}</h3>
              <p className="text-sm text-gray-400 font-mono text-xs">ID: {video.id}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-white font-mono">
              {video.progress}%
            </div>
            <div className={`text-xs font-semibold uppercase tracking-wider ${isFailed ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-indigo-400'}`}>
              {isFailed ? 'Error' : isCompleted ? 'Done' : STAGES[video.stage]}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <RealtimeProgressBar progress={video.progress} status={video.status} />
        </div>

        <div>
          <ProcessingTimeline currentStage={video.stage} status={video.status} />
        </div>

        {isFailed && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start justify-between gap-4">
            <div className="flex gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{video.error}</p>
            </div>
            <button 
              onClick={() => retryProcessing(video.id)}
              className="shrink-0 flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoStatusCard;
