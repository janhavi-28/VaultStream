import React from 'react';
import { CheckCheck, Clapperboard, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import UploadCard from './UploadCard';

const UploadQueue = ({ queue, stats, onTitleChange, onCancel, onRetry, onRemove, onClearCompleted }) => (
  <section className="space-y-5">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            <Clapperboard size={14} />
            Upload queue
          </div>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">Manage uploads like a studio pipeline</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Files move from queue to transfer to processing automatically. You can rename entries, cancel them, or retry failures without losing the rest of the batch.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/editor/library"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <FolderOpen size={16} />
            Open library
          </Link>
          <button
            type="button"
            onClick={onClearCompleted}
            disabled={!stats.completed}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <CheckCheck size={16} />
            Clear completed
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Queued</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.queued}</p>
        </div>
        <div className="rounded-2xl bg-sky-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Active</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.uploading}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Completed</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.completed}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Batch size</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.totalLabel}</p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {queue.map((item) => (
        <UploadCard
          key={item.id}
          item={item}
          onTitleChange={onTitleChange}
          onCancel={onCancel}
          onRetry={onRetry}
          onRemove={onRemove}
        />
      ))}
    </div>
  </section>
);

export default UploadQueue;
