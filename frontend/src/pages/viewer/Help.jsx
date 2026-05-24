import React from 'react';
import { HelpCircle } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const Help = () => {
  return (
    <div className="min-h-screen bg-[#141414] text-white md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8 pt-4">
        
        {/* Header & Back Button */}
        <div>
          <BackButton to="/viewer/dashboard" label="Back to Library" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-6 mb-2 flex items-center gap-3">
            <HelpCircle className="text-indigo-400" size={32} />
            Help & Support
          </h1>
          <p className="text-sm text-gray-400">
            Need permissions, custom workspace upgrades, or technical support? Select one of the options below.
          </p>
        </div>

        {/* Banners Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Banner 1: Want Editor Access */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/5 group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-300" />
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-500/10 p-3.5 text-indigo-400 border border-indigo-500/20 shrink-0">
                <span className="text-2xl leading-none">🎬</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white tracking-wide">Want Editor Access?</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Want to upload, manage, and verify video files for your organization? Contact the admin to request role permissions.
                </p>
                <div className="mt-4 flex items-center gap-2 text-indigo-300 font-semibold text-sm">
                  <a href="mailto:admin@vaultstream.com" className="hover:underline text-indigo-400 transition-colors truncate">
                    admin@vaultstream.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Banner 2: Support / Facing Issues */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-950/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 hover:shadow-amber-500/5 group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-300" />
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3.5 text-amber-400 border border-amber-500/20 shrink-0">
                <span className="text-2xl leading-none">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white tracking-wide">Facing Issues?</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Encountered a bug, playback error, or transcoding latency? Get in touch for immediate platform assistance.
                </p>
                <div className="mt-4 flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <a href="mailto:admin@vaultstream.com" className="hover:underline text-amber-400 transition-colors truncate">
                    admin@vaultstream.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;
