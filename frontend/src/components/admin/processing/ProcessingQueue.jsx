import React from 'react';
import { useSocket } from '../../../context/SocketContext';
import VideoStatusCard from './VideoStatusCard';
import { LayoutList } from 'lucide-react';

const ProcessingQueue = () => {
  const { queue } = useSocket();

  // Sort queue: processing first, then failed, then completed
  const sortedQueue = [...queue].sort((a, b) => {
    if (a.status === 'processing' && b.status !== 'processing') return -1;
    if (a.status !== 'processing' && b.status === 'processing') return 1;
    if (a.status === 'failed' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'failed') return 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 text-gray-100">
        <LayoutList size={24} className="text-indigo-400" />
        <h2 className="text-2xl font-bold">Active Pipeline</h2>
        <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-500/30">
          {queue.filter(v => v.status === 'processing').length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 scrollbar-hide pb-20">
        {sortedQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
            <LayoutList size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Queue is empty</p>
            <p className="text-sm">No videos currently processing</p>
          </div>
        ) : (
          sortedQueue.map(video => (
            <VideoStatusCard key={video.id} video={video} />
          ))
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;
