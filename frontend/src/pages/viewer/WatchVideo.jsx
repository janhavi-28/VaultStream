import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../../components/video/VideoPlayer';
import { Loader2, Lock, Calendar } from 'lucide-react';
import BackButton from '../../components/common/BackButton';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const WatchVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        const endpoint = isAuthenticated ? `/videos/${id}` : `/videos/public/${id}`;
        const response = await api.get(endpoint);
        if (response.data.success) {
          setVideo(response.data.video);
        } else {
          setError('Video not found');
        }
      } catch (err) {
        console.error('Failed to fetch video details:', err);
        setError('Could not load video. It may have been deleted or you do not have permission.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchVideo();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-slate-50">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Oops!</h2>
        <p className="mb-6 text-gray-500">{error || 'Video not found.'}</p>
        <button onClick={() => navigate('/viewer/dashboard')} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const videoSrc = `${baseUrl}/api/videos/stream/${video._id}`;
  const posterSrc = video.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 max-w-5xl mx-auto">
        <BackButton to={isAuthenticated ? "/viewer/dashboard" : "/browse"} label={isAuthenticated ? "Back to Dashboard" : "Back to Browse"} />
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-lg">
          {!isAuthenticated ? (
            <div className="relative aspect-video w-full bg-gray-900">
              <img src={posterSrc} alt={video.title} className="h-full w-full object-cover opacity-30 blur-sm" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-white/10 p-4 backdrop-blur-md">
                  <Lock size={32} className="text-white" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-white shadow-black drop-shadow-md">Login to watch full video</h2>
                <p className="mb-6 max-w-md text-gray-300 shadow-black drop-shadow-md">
                  This training material requires an authenticated session to stream securely.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-700 shadow-lg"
                >
                  Log In Now
                </button>
              </div>
            </div>
          ) : (
            <VideoPlayer src={videoSrc} poster={posterSrc} onVideoEnd={() => console.log('Video ended')} />
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{video.title || video.originalName}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={15} />
                <span>Uploaded on {new Date(video.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 md:text-base">
                {video.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchVideo;
