import React, { useState, useEffect } from 'react';
import { AlertTriangle, BarChart3, Building2, PlayCircle, UploadCloud, Users, Clock, ShieldAlert, Film, TrendingUp, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import StatCard from '../../components/admin/StatCard';
import AdminTable from '../../components/admin/AdminTable';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';

const statIcons = {
  uploads: UploadCloud,
  users: Users,
  streams: Building2,
  flagged: AlertTriangle,
};

const ActivityItem = ({ video, onDelete }) => {
  const sensitivityColor =
    video.sensitivity === 'flagged'
      ? 'text-rose-600'
      : video.sensitivity === 'safe'
      ? 'text-emerald-600'
      : 'text-amber-500';

  const sensitivityLabel =
    video.sensitivity === 'flagged' ? '🚨 Flagged' : video.sensitivity === 'safe' ? '✅ Safe' : '⏳ Processing';

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50">
          <Film size={15} className="text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900 truncate">{video.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            by <span className="font-medium text-slate-700">{video.uploadedBy?.name || 'Unknown'}</span>
            {video.uploadedBy?.email && ` · ${video.uploadedBy.email}`}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold ${sensitivityColor}`}>{sensitivityLabel}</span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={10} />
              {new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(video._id, video.title)}
        className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-rose-700 hover:bg-rose-50 active:scale-95 transition"
        title="Delete video"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifySuccess, notifyError } = useNotifications();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/stats');
      if (data.success) {
        setStats(data.stats);
        setRecentVideos(data.recentVideos || []);
        setModerationQueue(data.moderationQueue || []);
      }
    } catch (error) {
      console.error('Failed to fetch live admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApprove = async (id, title) => {
    try {
      await api.put(`/videos/admin/${id}/approve`);
      notifySuccess(`Approved video: "${title}"`);
      fetchStats();
    } catch (error) {
      notifyError('Failed to approve video', error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await api.delete(`/videos/admin/${id}`);
      notifySuccess(`Deleted video: "${title}"`);
      fetchStats();
    } catch (error) {
      notifyError('Failed to delete video', error.response?.data?.message || error.message);
    }
  };

  const statsCards = [
    {
      id: 'uploads',
      label: 'Total uploads',
      value: loading ? '—' : (stats?.totalVideos ?? 0).toLocaleString(),
      change: loading ? '' : `${stats?.pendingVideos ?? 0} pending in queue`,
      tone: 'sky',
    },
    {
      id: 'users',
      label: 'Total users',
      value: loading ? '—' : (stats?.totalUsers ?? 0).toLocaleString(),
      change: 'Active platform accounts',
      tone: 'indigo',
    },
    {
      id: 'streams',
      label: 'Active tenants',
      value: loading ? '—' : (stats?.tenantsCount ?? 0).toLocaleString(),
      change: 'Across multi-tenant pools',
      tone: 'emerald',
    },
    {
      id: 'flagged',
      label: 'Flagged content',
      value: loading ? '—' : (stats?.flaggedVideos ?? 0).toString(),
      change: 'Needs action in moderation',
      tone: 'rose',
    },
  ];

  const moderationRows = moderationQueue.map((v) => ({
    id: v._id,
    title: v.title,
    creator: v.uploadedBy?.name || 'Unknown',
    score: 'High',
    status: 'Flagged',
  }));

  return (
    <AdminShell
      badge="Admin control"
      title="Run the platform from one modern operations surface."
      description="System KPIs, moderation pressure, and platform activity are all consolidated here for fast decisions."
      actions={
        <Link to="/admin/users" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Manage users
        </Link>
      }
    >
      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <StatCard key={card.id} icon={statIcons[card.id]} label={card.label} value={card.value} change={card.change} tone={card.tone} />
        ))}
      </section>

      {/* Moderation pressure + Live activity feed */}
      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        {/* Moderation pressure */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Moderation pressure</h2>
              <p className="mt-1 text-sm text-slate-500">Recently flagged videos needing action.</p>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className="text-amber-600" size={20} />
              {(stats?.flaggedVideos ?? 0) > 0 && (
                <Link to="/admin/moderation" className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition">
                  View all →
                </Link>
              )}
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-4 text-center">Loading...</p>
          ) : moderationRows.length === 0 ? (
            <div className="py-8 text-center">
              <ShieldAlert size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-500">No flagged videos awaiting moderation.</p>
            </div>
          ) : (
            <AdminTable
              columns={[
                { key: 'title', label: 'Video' },
                { key: 'creator', label: 'Uploader' },
                { key: 'score', label: 'Severity' },
                { key: 'status', label: 'Status', type: 'badge' },
              ]}
              rows={moderationRows}
              actions={(row) => (
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(row.id, row.title)}
                    className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-emerald-700 hover:bg-emerald-50 active:scale-95"
                    title="Approve — mark Safe"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id, row.title)}
                    className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-rose-700 hover:bg-rose-50 active:scale-95"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {/* Live activity feed */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">Latest uploads across all tenants.</p>
            </div>
            <TrendingUp size={20} className="text-indigo-500" />
          </div>
          {loading ? (
            <p className="text-sm text-slate-400 py-4 text-center">Loading activity...</p>
          ) : recentVideos.length === 0 ? (
            <div className="py-8 text-center">
              <Film size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-500">No uploads yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentVideos.map((video) => (
                <ActivityItem key={video._id} video={video} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-4 md:grid-cols-4">
        <Link to="/admin/users" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:bg-sky-50">
          <Users size={22} className="text-sky-700" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">User management</h3>
          <p className="mt-2 text-sm text-slate-500">Create users, edit roles, suspend accounts, and delete access.</p>
        </Link>
        <Link to="/admin/videos" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50">
          <Film size={22} className="text-indigo-700" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Video library</h3>
          <p className="mt-2 text-sm text-slate-500">View, search, edit details, and permanently delete any video uploaded to the platform.</p>
        </Link>
        <Link to="/admin/tenants" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50">
          <Building2 size={22} className="text-emerald-700" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Tenant management</h3>
          <p className="mt-2 text-sm text-slate-500">Provision organizations, assign users, and inspect tenant analytics.</p>
        </Link>
        <Link to="/admin/moderation" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:bg-amber-50">
          <BarChart3 size={22} className="text-amber-700" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">Moderation panel</h3>
          <p className="mt-2 text-sm text-slate-500">Review flagged content, approve or reject videos, and inspect sensitivity scores.</p>
        </Link>
      </section>
    </AdminShell>
  );
};

export default AdminDashboard;
