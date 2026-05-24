import React from 'react';
import { STAGES } from '../../../context/SocketContext';
import { Check, Loader2, X } from 'lucide-react';

const ProcessingTimeline = ({ currentStage, status }) => {
  return (
    <div className="relative pt-12 pb-8">
      <div className="relative flex justify-between items-center z-10 px-2 sm:px-6">
        {/* Background Line */}
        <div className="absolute left-4 right-4 sm:left-8 sm:right-8 h-1 bg-gray-800 rounded -z-10 top-1/2 -translate-y-1/2">
          <div 
            className="h-full bg-indigo-500 rounded transition-all duration-700 ease-in-out" 
            style={{ width: `${(currentStage / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStage || status === 'completed';
          const isCurrent = idx === currentStage && status === 'processing';
          const isFailed = idx === currentStage && status === 'failed';
          
          let bgColor = 'bg-gray-800';
          let textColor = 'text-gray-500';
          let borderColor = 'border-gray-700';

          if (isCompleted) {
            bgColor = 'bg-indigo-500';
            textColor = 'text-indigo-400';
            borderColor = 'border-indigo-500';
          } else if (isCurrent) {
            bgColor = 'bg-indigo-600 animate-pulse';
            textColor = 'text-white';
            borderColor = 'border-indigo-400';
          } else if (isFailed) {
            bgColor = 'bg-red-500';
            textColor = 'text-red-400';
            borderColor = 'border-red-500';
          }

          // Use short, single-word action names to prevent any wrapping or overlapping
          const shortStage = stage
            .replace('Sensitivity Analysis', 'Analyze')
            .replace('Thumbnail Generation', 'Thumbnails')
            .replace('Streaming Optimization', 'Optimize')
            .replace('Compressing', 'Compress')
            .replace('Validating', 'Validate')
            .replace('Uploading', 'Upload')
            .replace('Completed', 'Done');

          return (
            <div key={stage} className="relative flex flex-col items-center group">
              {/* Label above */}
              <div className={`absolute bottom-full mb-3 flex justify-center transition-colors duration-300 ${textColor} whitespace-nowrap`}>
                <span className="text-[10px] sm:text-xs font-semibold leading-tight">
                  {shortStage}
                </span>
              </div>

              {/* Node */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${bgColor} ${borderColor} flex items-center justify-center transition-colors duration-300 shadow-lg ${isCurrent ? 'shadow-indigo-500/50' : ''} ${isFailed ? 'shadow-red-500/50' : ''}`}>
                {isCompleted && <Check size={12} className="text-white" />}
                {isFailed && <X size={12} className="text-white" />}
              </div>
              
              {/* Processing Spinner below */}
              <div className="absolute top-full mt-3 flex justify-center w-24">
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="hidden sm:inline">Processing</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingTimeline;
