import React from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Terminal, Info, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

const getIcon = (type) => {
  switch (type) {
    case 'info': return <Info size={14} className="text-blue-400" />;
    case 'progress': return <Activity size={14} className="text-indigo-400" />;
    case 'success': return <CheckCircle2 size={14} className="text-green-400" />;
    case 'error': return <AlertTriangle size={14} className="text-red-400" />;
    case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
    default: return <Terminal size={14} className="text-gray-400" />;
  }
};

const getColor = (type) => {
  switch (type) {
    case 'info': return 'text-blue-300';
    case 'progress': return 'text-indigo-300';
    case 'success': return 'text-green-300';
    case 'error': return 'text-red-300';
    case 'warning': return 'text-yellow-300';
    default: return 'text-gray-300';
  }
};

const LiveActivityFeed = () => {
  const { activityFeed } = useSocket();

  return (
    <div className="bg-[#0f111a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[600px]">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300 font-medium text-sm">
          <Terminal size={16} /> Live Activity Log
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm flex flex-col gap-2 scrollbar-hide">
        {activityFeed.length === 0 ? (
          <div className="text-gray-600 italic">Waiting for events...</div>
        ) : (
          activityFeed.map((event) => (
            <div key={event.id} className="flex gap-3 group animate-[fade-in_0.3s_ease-out]">
              <div className="text-gray-600 shrink-0">
                {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="shrink-0 mt-0.5">
                {getIcon(event.type)}
              </div>
              <div className={`break-words ${getColor(event.type)}`}>
                {event.message}
                {event.videoId && (
                  <span className="text-gray-500 ml-2 text-[10px]">[{event.videoId}]</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveActivityFeed;
