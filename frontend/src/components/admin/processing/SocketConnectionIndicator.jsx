import React from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

const SocketConnectionIndicator = () => {
  const { isConnected, isSimulating } = useSocket();

  return (
    <div className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <Wifi size={16} className="text-green-500" />
            <span className="text-sm font-medium text-green-500">Connected</span>
          </>
        ) : (
          <>
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <WifiOff size={16} className="text-red-500" />
            <span className="text-sm font-medium text-red-500">Disconnected</span>
          </>
        )}
      </div>

      {isSimulating && (
        <>
          <div className="w-px h-4 bg-gray-600"></div>
          <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-1 rounded border border-indigo-500/30 uppercase tracking-wider animate-pulse">
            Simulation Mode Active
          </span>
        </>
      )}
    </div>
  );
};

export default SocketConnectionIndicator;
