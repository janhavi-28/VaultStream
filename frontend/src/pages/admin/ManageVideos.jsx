import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, X, Check, Filter, PlayCircle } from 'lucide-react';
import AdminShell from '../../components/admin/AdminShell';
import AdminTable from '../../components/admin/AdminTable';
import api from '../../api/axios';
import { useNotifications } from '../../context/NotificationContext';

const FILTER_OPTIONS = ['All', 'Safe', 'Flagged', 'Pending'];

const sensitivityLabel = (s) => {
  if (s === 'safe') return 'Safe';
  if (s === 'flagged') return 'Flagged';
  return 'Pending';
};

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [filter, setFilter] = useState('All');
  const { notifySuccess, notifyError } = useNotifications();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/videos/admin/all');
      setVideos(data.videos);
    } catch (error) {
      notifyError('Failed to fetch videos', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleEditClick = (video) => {
    setEditingId(video._id);
    setEditForm({ title: video.title, description: video.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/videos/admin/${id}`, editForm);
      notifySuccess('Video updated successfully');
      setEditingId(null);
      fetchVideos();
    } catch (error) {
      notifyError('Failed to update video', error.response?.data?.message || error.message);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video? This cannot be undone.')) return;
    try {
      await api.delete(`/videos/admin/${id}`);
      notifySuccess('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      notifyError('Failed to delete video', error.response?.data?.message || error.message);
    }
  };

  const renderEditRow = (video) => {
    if (editingId === video._id) {
      return (
        <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <input
            className="px-3 py-1.5 border border-slate-300 rounded outline-none focus:border-sky-500 text-sm"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            placeholder="Video Title"
          />
          <textarea
            className="px-3 py-1.5 border border-slate-300 rounded outline-none focus:border-sky-500 text-sm"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          <div className="flex gap-2 justify-end mt-1">
            <button onClick={cancelEdit} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded cursor-pointer">
              <X size={16} />
            </button>
            <button onClick={() => saveEdit(video._id)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded cursor-pointer">
              <Check size={16} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <Link
        to={`/viewer/watch/${video._id}`}
        className="font-medium text-slate-900 hover:text-indigo-600 cursor-pointer hover:underline transition"
        title="Click to play video"
      >
        {video.title}
      </Link>
    );
  };

  // Apply filter
  const filtered = videos.filter((v) => {
    if (filter === 'All') return true;
    return sensitivityLabel(v.sensitivity) === filter;
  });

  // Format rows for the AdminTable
  const tableRows = filtered.map((video) => ({
    id: video._id,
    titleRender: renderEditRow(video),
    uploader: (
      <div className="flex flex-col">
        <span className="font-medium text-slate-800">{video.uploadedBy?.name || 'Unknown'}</span>
        {video.uploadedBy?.email && <span className="text-xs text-slate-500">{video.uploadedBy.email}</span>}
      </div>
    ),
    tenant: video.tenantId?.name || '—',
    sensitivity: sensitivityLabel(video.sensitivity),
    status: video.status === 'completed' ? 'Completed' : video.status?.charAt(0).toUpperCase() + video.status?.slice(1) || 'Unknown',
    date: new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    _original: video,
  }));

  return (
    <AdminShell
      badge="Video Library"
      title="Global Video Management"
      description="View, filter, and manage all videos uploaded across all organizations."
    >
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={15} className="text-slate-400" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
              filter === opt
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {opt}
            {opt !== 'All' && (
              <span className="ml-1.5 opacity-70">
                ({videos.filter((v) => sensitivityLabel(v.sensitivity) === opt).length})
              </span>
            )}
            {opt === 'All' && <span className="ml-1.5 opacity-70">({videos.length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 rounded-3xl border border-slate-200 bg-white shadow-sm">
          Loading videos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 rounded-3xl border border-slate-200 bg-white shadow-sm">
          No videos match the selected filter.
        </div>
      ) : (
        <AdminTable
          columns={[
            { key: 'titleRender', label: 'Video Title' },
            { key: 'uploader', label: 'Uploaded By' },
            { key: 'tenant', label: 'Organization' },
            { key: 'sensitivity', label: 'Safety', type: 'badge' },
            { key: 'status', label: 'Status', type: 'badge' },
            { key: 'date', label: 'Upload Date' },
          ]}
          rows={tableRows}
          actions={(row) => (
            <div className="inline-flex gap-2">
              <Link
                to={`/viewer/watch/${row.id}`}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-indigo-700 hover:bg-indigo-50 active:scale-95 flex items-center justify-center animate-transition"
                title="Watch video"
              >
                <PlayCircle size={15} />
              </Link>
              <button
                type="button"
                onClick={() => handleEditClick(row._original)}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 active:scale-95 flex items-center justify-center"
                title="Edit video"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => deleteVideo(row.id)}
                className="cursor-pointer rounded-lg border border-slate-200 p-2 text-rose-700 hover:bg-rose-50 active:scale-95 flex items-center justify-center"
                title="Delete video"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        />
      )}
    </AdminShell>
  );
};

export default ManageVideos;
