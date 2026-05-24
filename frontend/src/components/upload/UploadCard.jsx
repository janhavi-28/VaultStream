import React from 'react';
import { AlertTriangle, CheckCircle2, LoaderCircle, RotateCcw, Square, Trash2, Video, XCircle } from 'lucide-react';
import UploadProgress from './UploadProgress';
import { formatBytes, formatDuration } from '../../hooks/useVideoValidation';

const STATUS_STYLES = {
  queued: 'bg-slate-100 text-slate-700',
  uploading: 'bg-sky-100 text-sky-700',
  processing: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
  canceled: 'bg-slate-200 text-slate-700',
};

const STATUS_LABELS = {
  queued: 'Queued',
  uploading: 'Uploading',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  canceled: 'Canceled',
};

const UploadCard = ({ item, onTitleChange, onCancel, onRetry, onRemove }) => {
  const showCancel = item.status === 'queued' || item.status === 'uploading' || item.status === 'processing';
  const showRetry = item.status === 'failed' || item.status === 'canceled';
  const showRemove = item.status === 'completed' || item.status === 'failed' || item.status === 'canceled';

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="relative aspect-video bg-slate-950 md:aspect-auto">
          {item.thumbnailDataUrl ? (
            <img src={item.thumbnailDataUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <Video size={36} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/85 to-transparent px-4 py-3 text-xs text-white">
            <span>{formatDuration(item.duration)}</span>
            <span>{formatBytes(item.file.size)}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={item.title}
                onChange={(event) => onTitleChange(item.id, event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-semibold text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
                placeholder="Give this upload a title"
              />
              <p className="mt-2 truncate text-sm text-slate-500">{item.file.name}</p>
            </div>

            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
          </div>

          <div className="mt-5">
            <UploadProgress progress={item.progress} status={item.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <div>
              <span className="font-medium text-slate-800">Speed</span>
              <p>{item.speedBytesPerSecond ? `${formatBytes(item.speedBytesPerSecond)}/s` : 'Waiting for transfer'}</p>
            </div>
            <div>
              <span className="font-medium text-slate-800">ETA</span>
              <p>{item.etaLabel}</p>
            </div>
            <div>
              <span className="font-medium text-slate-800">Uploaded</span>
              <p>{formatBytes(item.uploadedBytes)} / {formatBytes(item.file.size)}</p>
            </div>
          </div>

          {item.error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {item.error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {showCancel ? (
              <button
                type="button"
                onClick={() => onCancel(item.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Square size={16} />
                Cancel
              </button>
            ) : null}

            {showRetry ? (
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                <RotateCcw size={16} />
                Retry
              </button>
            ) : null}

            {showRemove ? (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Trash2 size={16} />
                Remove
              </button>
            ) : null}

            <div className="ml-auto inline-flex items-center gap-2 text-sm font-medium">
              {item.status === 'completed' ? (
                <span className={`inline-flex items-center gap-2 ${item.sensitivity === 'flagged' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {item.sensitivity === 'flagged' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                  {item.sensitivity === 'flagged' ? 'Flagged (Sensitivity)' : 'Safe (Completed)'}
                </span>
              ) : null}
              {item.status === 'uploading' || item.status === 'processing' ? (
                <span className="inline-flex items-center gap-2 text-sky-700">
                  <LoaderCircle size={16} className="animate-spin" />
                  Active
                </span>
              ) : null}
              {item.status === 'failed' ? (
                <span className="inline-flex items-center gap-2 text-rose-700">
                  <XCircle size={16} />
                  Needs attention
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default UploadCard;
