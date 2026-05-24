import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthGateModal = ({ isOpen, onClose, video }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAuthRedirect = (path) => {
    // Save the intended video to localStorage to redirect back after login
    if (video) {
      localStorage.setItem('redirectUrl', `/viewer/watch/${video._id}`);
    }
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header image / gradient */}
            <div className="h-32 bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center -mb-16 z-10">
                <Lock className="w-8 h-8 text-[#6C63FF]" />
              </div>
            </div>

            <div className="pt-12 pb-8 px-6 text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Sign in to watch
              </h3>
              <p className="text-slate-500 mb-6 px-4">
                {video ? (
                  <>Unlock <span className="font-medium text-slate-700">"{video.title}"</span> by creating a free account.</>
                ) : (
                  'Create an account to unlock this video and our full library.'
                )}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleAuthRedirect('/register')}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white rounded-xl font-medium shadow-md shadow-[#6C63FF]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} />
                  Create Free Account
                </button>
                <button
                  onClick={() => handleAuthRedirect('/login')}
                  className="w-full py-3.5 px-4 bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                >
                  Sign in to existing account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthGateModal;
