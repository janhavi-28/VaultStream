import React from 'react';
import ProcessingQueue from '../../components/admin/processing/ProcessingQueue';
import LiveActivityFeed from '../../components/admin/processing/LiveActivityFeed';
import SocketConnectionIndicator from '../../components/admin/processing/SocketConnectionIndicator';
import { useSocket } from '../../context/SocketContext';

const ProcessingDashboard = () => {
  const { isSimulating, setIsSimulating } = useSocket();

  return (
    <div className="min-h-screen bg-[#0a0c10] p-4 font-sans text-gray-200 md:-mx-6 md:-mt-6 md:p-6 lg:-mx-8 lg:-mt-8 lg:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">Video Processing Pipeline</h1>
          <p className="text-sm text-gray-400 md:text-base">Real-time monitoring of video ingestion and encoding queues.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <button onClick={() => setIsSimulating(!isSimulating)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          <SocketConnectionIndicator />
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-6 lg:h-[calc(100vh-180px)] lg:grid-cols-3 lg:gap-8">
        <div className="h-full lg:col-span-2">
          <ProcessingQueue />
        </div>
        <div className="h-full">
          <LiveActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default ProcessingDashboard;
