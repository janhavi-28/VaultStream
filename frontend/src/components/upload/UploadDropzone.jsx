import React, { useRef, useState } from 'react';
import { Film, FolderPlus, Sparkles, UploadCloud } from 'lucide-react';
import { formatBytes, formatDuration } from '../../hooks/useVideoValidation';

const UploadDropzone = ({ onFilesSelected, limits, disabled }) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSelection = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onFilesSelected(files);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_34%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)] px-6 py-8 md:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm ring-1 ring-sky-100">
          <Sparkles size={14} />
          Professional uploader
        </div>
        <h3 className="mt-4 text-3xl font-bold text-slate-950">Drop a whole batch and let the queue do the work</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Multi-file drag and drop, local validation, automatic thumbnails, live progress, ETA, cancellation, and retry support are all ready here even before the backend ingest service lands.
        </p>
      </div>

      <div className="p-6 md:p-8">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            if (!disabled) handleSelection(event.dataTransfer.files);
          }}
          className={`rounded-[1.75rem] border-2 border-dashed px-6 py-14 text-center transition-all duration-200 ${
            dragActive
              ? 'border-sky-400 bg-sky-50 shadow-inner'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(event) => {
              handleSelection(event.target.files);
              event.target.value = '';
            }}
            disabled={disabled}
          />

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm ring-1 ring-slate-200">
            <UploadCloud size={34} />
          </div>
          <h4 className="mt-6 text-xl font-semibold text-slate-900">Drag videos here or browse from your device</h4>
          <p className="mt-2 text-sm text-slate-500">
            Supports {limits.allowedMimeTypes.map((type) => type.replace('video/', '').toUpperCase()).join(', ')} up to {formatBytes(limits.maxSizeBytes)} each
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Film size={16} />
                <span className="text-sm font-semibold">Local validation</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Corrupt files and unsupported formats are rejected before the queue starts.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <FolderPlus size={16} />
                <span className="text-sm font-semibold">Smart batching</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Drop multiple files at once and the uploader will serialize them automatically.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">Thumbnail capture</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Preview frames are extracted locally and uploads are capped at {formatDuration(limits.maxDurationSeconds)}.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadDropzone;
