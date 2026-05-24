import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <ShieldAlert className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button 
          onClick={() => navigate(role ? `/${role}/dashboard` : '/login')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mb-3"
        >
          Return to Safety
        </button>
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
