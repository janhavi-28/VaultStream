import React, { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Play, CheckCircle2, AlertTriangle, Clock, VideoOff, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'safe':
      return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12} /> Safe</span>;
    case 'flagged':
      return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1"><AlertTriangle size={12} /> Flagged</span>;
    case 'processing':
      return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> Processing</span>;
    default:
      return null;
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const VideoRow = memo(({ video, onOpen }) => (
  <button
    type="button"
    onClick={() => onOpen(video._id)}
    className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
  >
    <div className="relative h-20 w-36 overflow-hidden rounded-lg bg-gray-100 shrink-0">
      {video.thumbnailPath ? (
        <img
          src={`http://localhost:5000/${video.thumbnailPath}`}
          alt={video.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-90 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-200">
          <VideoOff size={24} className="text-gray-400" />
        </div>
      )}
      {video.duration && (
        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {formatDuration(video.duration)}
        </span>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="truncate font-semibold text-gray-900 group-hover:text-indigo-600">{video.title}</h3>
      {video.description && <p className="mt-0.5 text-xs text-gray-400 truncate">{video.description}</p>}
      <p className="mt-1 text-xs text-gray-500">Added {new Date(video.createdAt).toLocaleDateString()}</p>
    </div>
    <StatusBadge status={video.status} />
    <div className="rounded-full bg-indigo-100 p-2 text-indigo-700 shrink-0"><Play size={16} className="fill-current" /></div>
  </button>
));

const FILTERS = ['All', 'Safe', 'Processing', 'Flagged'];

const MyVideos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get('/videos');
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError('Could not load your videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || video.status?.toLowerCase() === activeFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [videos, activeFilter, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl pb-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-500">Access and watch videos assigned to your account.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto p-1" role="list" aria-label="Video library results">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm">Loading your videos...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertTriangle size={32} className="mx-auto mb-2 text-red-400" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-20 text-center">
            <VideoOff size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              {videos.length === 0 ? 'No videos yet' : 'No videos found'}
            </h3>
            <p className="text-gray-500">
              {videos.length === 0 ? 'Videos uploaded to your workspace will appear here.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <VideoRow key={video._id} video={video} onOpen={(id) => navigate(`/viewer/watch/${id}`)} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyVideos;
