import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Film, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { formatBytes, formatDuration } from '../hooks/useVideoValidation';

const PublicLibrary = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicVideos = async () => {
      try {
        const response = await api.get('/videos/public');
        if (response.data.success) {
          setVideos(response.data.videos);
        }
      } catch (error) {
        console.error('Failed to fetch public videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0c10]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p>Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] p-4 font-sans text-gray-200 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Browse Library</h1>
          <p className="mt-2 text-gray-400">Discover public training materials and events.</p>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-[#11141a] p-12 text-center">
            <Film className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <h3 className="text-xl font-bold text-white">No videos available</h3>
            <p className="mt-2 text-gray-400">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => {
              const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
              const posterSrc = video.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop';
              const duration = formatDuration(Math.max(0, Math.round(video.duration || 0)));

              return (
                <div 
                  key={video._id} 
                  className="group cursor-pointer rounded-xl bg-[#11141a] transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10"
                  onClick={() => navigate(`/watch/${video._id}`)}
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gray-800">
                    <img 
                      src={posterSrc} 
                      alt={video.title || video.originalName} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <div className="rounded-full bg-indigo-600 p-3 text-white shadow-lg">
                        <Play size={24} className="fill-current ml-1" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white">
                      {duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white group-hover:text-indigo-400">
                      {video.title || video.originalName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {video.uploadedBy?.name && (
                        <span className="font-medium text-gray-400">{video.uploadedBy.name}</span>
                      )}
                      <span>•</span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLibrary;
