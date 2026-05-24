import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Home,
  PlayCircle,
  RefreshCw,
  UploadCloud,
  Video,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useTenant } from '../../context/TenantContext';
import { formatBytes, formatDuration } from '../../hooks/useVideoValidation';

import api from '../../api/axios';

const STATUS_STYLES = {
  ready: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-amber-100 text-amber-700',
  uploading: 'bg-sky-100 text-sky-700',
  failed: 'bg-rose-100 text-rose-700',
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown date';
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const DashboardCard = ({ icon: Icon, label, value, hint, tone = 'slate' }) => {
  const toneClasses = {
    slate: 'bg-slate-50 text-slate-700 ring-slate-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${toneClasses[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

const EditorDashboard = () => {
  const [stats, setStats] = useState({
    totalVideos: 0,
    readyVideos: 0,
    activePipeline: 0,
    failedPipeline: 0,
    storageUsed: 0,
    totalDurationSeconds: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTenant } = useTenant();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats and recent uploads concurrently
        const [statsRes, recentRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent?limit=4'),
        ]);

        if (statsRes.data.success) {
          const s = statsRes.data.stats;
          setStats({
            totalVideos: s.totalVideos,
            readyVideos: s.statusCounts?.ready || s.statusCounts?.completed || 0,
            activePipeline: (s.statusCounts?.processing || 0) + (s.statusCounts?.uploading || 0),
            failedPipeline: s.statusCounts?.failed || 0,
            storageUsed: s.totalStorageBytes || 0,
            totalDurationSeconds: s.totalDurationSeconds || 0,
          });
        }

        if (recentRes.data.success) {
          setRecentVideos(recentRes.data.videos);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentTenant]);

  const attentionItems = useMemo(() => {
    // We could fetch real queue errors here if needed, but for now we'll use recent videos that failed
    const failedProcessing = recentVideos
      .filter((video) => video.status === 'failed')
      .map((video) => ({
        id: `failed-${video._id}`,
        title: video.title || video.originalName,
        detail: 'Processing needs another pass.',
        kind: 'failed',
        actionLabel: 'Retry',
        onAction: () => console.log('Retry', video._id), // Placeholder for retry
      }));

    const metadataGaps = recentVideos
      .filter((video) => !video.title || video.title.trim().length < 3)
      .map((video) => ({
        id: `metadata-${video._id}`,
        title: video.originalName || 'Untitled upload',
        detail: 'This upload still needs a stronger title before publishing.',
        kind: 'warning',
        actionHref: '/editor/library',
        actionLabel: 'Open library',
      }));

    return [...failedProcessing, ...metadataGaps].slice(0, 4);
  }, [recentVideos]);

  const featuredVideo = recentVideos[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_38%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.18),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] px-6 py-8 md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm ring-1 ring-sky-100">
                <Home size={14} />
                Editor dashboard
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Stay on top of uploads, processing, and what needs attention.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                This workspace brings together recent uploads, live pipeline activity, and a health check for {currentTenant?.name} so each organization stays isolated.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/editor/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <UploadCloud size={16} />
                Upload video
              </Link>
              <Link
                to="/editor/library"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FolderKanban size={16} />
                Open library
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          icon={Video}
          label="Total videos"
          value={stats.totalVideos}
          hint="Uploads currently stored in your editor library."
          tone="slate"
        />
        <DashboardCard
          icon={CheckCircle2}
          label="Ready to publish"
          value={stats.readyVideos}
          hint="Processed assets that are ready for playback."
          tone="emerald"
        />
        <DashboardCard
          icon={Clock3}
          label="Active pipeline"
          value={stats.activePipeline}
          hint="Videos still moving through validation and transcoding."
          tone="amber"
        />
        <DashboardCard
          icon={BarChart3}
          label="Storage footprint"
          value={formatBytes(stats.storageUsed)}
          hint={`${formatDuration(stats.totalDurationSeconds)} of uploaded video across the channel.`}
          tone="sky"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Recent uploads</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest assets with status, size, and quick visibility into readiness.</p>
              </div>
              <Link to="/editor/library" className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800">
                View all
                <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 animate-pulse">
                    <div className="aspect-video bg-slate-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-2 bg-slate-200 rounded w-full mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-rose-600">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                {error}
              </div>
            ) : recentVideos.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {recentVideos.map((video) => {
                  const normalizedStatus = (video.status || 'completed').toLowerCase();
                  const statusTone = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.completed;

                  return (
                    <article key={video._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                      <div className="aspect-video bg-slate-200">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <PlayCircle size={40} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-slate-900">{video.title || video.originalName || 'Untitled upload'}</h3>
                            <p className="mt-1 truncate text-sm text-slate-500">{video.originalName}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                            {video.status || 'Completed'}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>{formatBytes(video.size || 0)}</span>
                          <span>{formatDate(video.createdAt)}</span>
                          {video.duration ? <span>{formatDuration(video.duration)}</span> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm ring-1 ring-slate-200">
                  <UploadCloud size={24} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">No uploads yet</h3>
                <p className="mt-2 text-sm text-slate-500">Start with the new queue uploader and your recent videos will appear here automatically.</p>
                <Link
                  to="/editor/upload"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Upload first video
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Quick actions</h2>
                <p className="mt-1 text-sm text-slate-500">Common next steps for managing the editor workflow.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Link to="/editor/upload" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-200 hover:bg-sky-50">
                <UploadCloud size={22} className="text-sky-700" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">Start a new upload</h3>
                <p className="mt-2 text-sm text-slate-500">Drop one or many files into the queue-based uploader.</p>
              </Link>
              <Link to="/editor/library" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50">
                <FolderKanban size={22} className="text-emerald-700" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">Manage your library</h3>
                <p className="mt-2 text-sm text-slate-500">Review thumbnails, open assets, and check processed videos.</p>
              </Link>
              <Link to="/admin/processing" className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:border-amber-200 hover:bg-amber-50">
                <RefreshCw size={22} className="text-amber-700" />
                <h3 className="mt-4 text-base font-semibold text-slate-900">Inspect the pipeline</h3>
                <p className="mt-2 text-sm text-slate-500">Open the deeper processing dashboard for stage-by-stage diagnostics.</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Live pipeline</h2>
                <p className="mt-1 text-sm text-slate-500">A compact view of videos currently moving through processing.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {stats.activePipeline} active
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {loading ? (
                 <div className="animate-pulse space-y-4">
                    <div className="h-16 bg-slate-50 rounded-2xl border border-slate-200"></div>
                    <div className="h-16 bg-slate-50 rounded-2xl border border-slate-200"></div>
                 </div>
              ) : recentVideos.filter(v => ['uploading', 'processing'].includes(v.status)).length ? (
                recentVideos.filter(v => ['uploading', 'processing'].includes(v.status)).slice(0, 4).map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-500 capitalize">
                          {item.status}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">In Progress</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-sky-500 w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  No pipeline jobs are active right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Needs attention</h2>
            <p className="mt-1 text-sm text-slate-500">Surface issues that could block publishing or require another pass.</p>

            <div className="mt-5 space-y-4">
              {attentionItems.length ? (
                attentionItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-2 ${item.kind === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        <AlertTriangle size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                        {item.onAction ? (
                          <button
                            type="button"
                            onClick={item.onAction}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-rose-700 hover:text-rose-800"
                          >
                            <RefreshCw size={14} />
                            {item.actionLabel}
                          </button>
                        ) : null}
                        {item.actionHref ? (
                          <Link to={item.actionHref} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800">
                            {item.actionLabel}
                            <ArrowRight size={14} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  Everything looks healthy. No failed processing jobs or metadata gaps were detected.
                </div>
              )}
            </div>
          </div>

          {featuredVideo ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-video bg-slate-200">
                {featuredVideo.thumbnail ? (
                  <img src={featuredVideo.thumbnail} alt={featuredVideo.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <PlayCircle size={42} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Latest delivery</p>
                <h2 className="mt-3 text-xl font-bold text-slate-950">{featuredVideo.title || featuredVideo.originalName || 'Untitled upload'}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Added {formatDate(featuredVideo.createdAt)} with {formatBytes(featuredVideo.size || 0)} ready for your library workflow.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default EditorDashboard;
