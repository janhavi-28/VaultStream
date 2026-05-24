import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Eye, RefreshCw, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';

const StatusBadge = ({ sensitivity }) => {
  if (sensitivity === 'flagged') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
        <ShieldAlert size={11} />
        Flagged
      </span>
    );
  }
  if (sensitivity === 'safe') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        <ShieldCheck size={11} />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
      <Clock size={11} />
      Pending
    </span>
  );
};

const Moderation = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState(null);
  const { notifySuccess, notifyError } = useNotifications();

  const fetchFlagged = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/videos/admin/flagged');
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (error) {
      notifyError('Failed to load flagged videos', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlagged();
  }, [fetchFlagged]);

  const handleApprove = async (id, title) => {
    try {
      await api.put(`/videos/admin/${id}/approve`);
      notifySuccess(`"${title}" approved — marked as Safe`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      notifyError('Approve failed', error?.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/videos/admin/${id}`);
      notifySuccess(`"${title}" deleted`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      notifyError('Delete failed', error?.response?.data?.message || error.message);
    }
  };

  const stats = {
    total: videos.length,
    flagged: videos.filter((v) => v.sensitivity === 'flagged').length,
  };

  return (
    <AdminShell
      badge="Moderation"
      title="Flagged content review"
      description="Review sensitivity signals, approve or reject flagged videos, and keep your platform clean."
    >
      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Needs Review</p>
          <p className="mt-3 text-3xl font-bold text-rose-600">{stats.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Flagged Videos</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{stats.flagged}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Actions</p>
            <p className="mt-2 text-sm text-slate-400">Approve = mark Safe · Delete = remove permanently</p>
          </div>
          <button
            onClick={fetchFlagged}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading flagged videos...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck size={40} className="mx-auto text-emerald-400 mb-3" />
            <p className="text-slate-700 font-semibold">All clear! No flagged videos.</p>
            <p className="text-sm text-slate-400 mt-1">The moderation queue is empty.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Video</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 hidden md:table-cell">Uploaded By</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 hidden lg:table-cell">Organization</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600 hidden xl:table-cell">Flagged On</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.map((video) => (
                <tr key={video._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 line-clamp-1">{video.title}</span>
                    {video.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{video.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-medium">{video.uploadedBy?.name || 'Unknown'}</span>
                      {video.uploadedBy?.email && (
                        <span className="text-xs text-slate-400">{video.uploadedBy.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-600">
                    {video.tenantId?.name || 'No Org'}
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell text-slate-500 text-xs">
                    {new Date(video.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge sensitivity={video.sensitivity} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Watch */}
                      <button
                        type="button"
                        onClick={() => setPreviewVideo(video)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-sky-600 hover:bg-sky-50 active:scale-95 transition"
                        title="Preview video"
                        aria-label={`Preview ${video.title}`}
                      >
                        <Eye size={15} />
                      </button>
                      {/* Approve */}
                      <button
                        type="button"
                        onClick={() => handleApprove(video._id, video.title)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-emerald-700 hover:bg-emerald-50 active:scale-95 transition"
                        title="Approve — mark as Safe"
                        aria-label={`Approve ${video.title}`}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(video._id, video.title)}
                        className="cursor-pointer rounded-lg border border-slate-200 p-2 text-rose-700 hover:bg-rose-50 active:scale-95 transition"
                        title="Delete video permanently"
                        aria-label={`Delete ${video.title}`}
                      >
                        <XCircle size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{previewVideo.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  By {previewVideo.uploadedBy?.name || 'Unknown'} · {previewVideo.tenantId?.name || 'No Org'}
                </p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>
            <video
              className="w-full rounded-2xl bg-slate-950 aspect-video"
              controls
              src={`/api/videos/stream/${previewVideo._id}`}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => { handleApprove(previewVideo._id, previewVideo.title); setPreviewVideo(null); }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
              <button
                onClick={() => { handleDelete(previewVideo._id, previewVideo.title); setPreviewVideo(null); }}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                <XCircle size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
};

export default Moderation;
