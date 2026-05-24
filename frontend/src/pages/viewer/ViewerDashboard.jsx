import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ViewerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#141414] text-white md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 transition-colors duration-300">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">
          Welcome, <span className="text-indigo-400">{user?.name || 'Viewer'}</span>
        </h1>
      </div>
    </div>
  );
};

export default ViewerDashboard;
