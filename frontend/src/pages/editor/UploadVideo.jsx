import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, WandSparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/common/BackButton';
import UploadDropzone from '../../components/upload/UploadDropzone';
import UploadQueue from '../../components/upload/UploadQueue';
import ValidationAlert from '../../components/upload/ValidationAlert';
import useVideoValidation from '../../hooks/useVideoValidation';
import { useUploadQueueContext } from '../../context/UploadQueueContext';

const UploadVideo = () => {
  const [validationAlerts, setValidationAlerts] = useState([]);
  const { role } = useAuth();
  const { limits, validateFiles } = useVideoValidation();
  const { queue, stats, addFiles, updateTitle, cancelUpload, retryUpload, removeFile, clearCompleted } = useUploadQueueContext();

  const handleFilesSelected = async (files) => {
    const { accepted, rejected } = await validateFiles(files);

    if (rejected.length) {
      setValidationAlerts((currentAlerts) => [...rejected, ...currentAlerts].slice(0, 6));
    }

    if (accepted.length) {
      addFiles(accepted);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <BackButton to={`/${role}/dashboard`} label="Back to Dashboard" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            <WandSparkles size={14} />
            {role === 'admin' ? 'Admin workspace' : 'Editor workspace'}
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">Upload Video</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Upload videos securely to your workspace. Supports concurrent uploads, real-time progress tracking, auto-retry, and post-upload AI processing.
          </p>
        </div>

        <Link
          to={role === 'admin' ? '/admin/videos' : '/editor/library'}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          View library
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-900">
        <div className="flex items-start gap-3">
          <Info size={18} className="mt-0.5 shrink-0 text-sky-700" />
          <p>
            Default validation assumptions are <strong>2 GB max size</strong>, <strong>2 hours max duration</strong>, and <strong>MP4, MOV, WEBM</strong>. The hook is isolated so we can tighten these later without rewriting the queue flow.
          </p>
        </div>
      </div>

      <ValidationAlert alerts={validationAlerts} onDismiss={() => setValidationAlerts([])} />

      <UploadDropzone onFilesSelected={handleFilesSelected} limits={limits} disabled={false} />

      {queue.length ? (
        <UploadQueue
          queue={queue}
          stats={stats}
          onTitleChange={updateTitle}
          onCancel={cancelUpload}
          onRetry={retryUpload}
          onRemove={removeFile}
          onClearCompleted={clearCompleted}
        />
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          Your queue is empty. Drop a few videos above to see validation, progress, ETA, and post-upload processing states kick in.
        </div>
      )}
    </div>
  );
};

export default UploadVideo;
