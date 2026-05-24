import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, User, Upload, FileVideo, Users, Lock, 
  Loader2, PlayCircle, BarChart2, Settings as SettingsIcon
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile || !title) return;

    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface font-sans selection:bg-primary-container/30">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-primary p-1.5 rounded text-on-primary">
            <PlayCircle size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-on-surface">VaultStream</span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text" 
              placeholder="Search videos..." 
              className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-on-surface-variant">
            <User size={18} />
            <span className="text-sm font-medium">Admin</span>
          </div>

          <button 
            onClick={() => navigate('/settings')}
            className="text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container p-2 rounded-full"
            title="Settings"
          >
            <SettingsIcon size={20} />
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-outline-variant">
            <img 
              src="https://i.pravatar.cc/150?img=33" 
              alt="John Doe" 
              className="w-8 h-8 rounded-full border border-outline-variant"
            />
            <span className="text-sm font-medium text-on-surface hidden sm:block">John Doe</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface mb-8">Welcome back, John Doe!</h1>
          
          {/* Upload Form Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 shadow-[0px_10px_15px_-3px_rgba(15,23,42,0.05)]">
            <form onSubmit={handleUpload} className="space-y-6">
              
              {/* Inputs Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">Video Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title" 
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant block">Select Video File *</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-center text-on-surface-variant hover:bg-surface-container transition-colors">
                      {selectedFile ? selectedFile.name : 'Click or drag file here'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${dragActive ? 'border-primary bg-primary-container/10' : 'border-outline-variant bg-surface hover:bg-surface-container hover:border-outline'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="mb-4 text-outline">
                  <Upload size={32} />
                </div>
                <h3 className="text-on-surface font-medium mb-1">Drag and drop your video here</h3>
                <p className="text-sm text-on-surface-variant">or click above to select a file</p>
              </div>

              {/* Upload Button */}
              <button 
                type="submit"
                disabled={!selectedFile || !title || isUploading}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                  ${(!selectedFile || !title || isUploading) 
                    ? 'bg-surface-container-highest text-outline cursor-not-allowed' 
                    : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-sm hover:shadow-md active:scale-[0.98]'
                  }
                `}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Video'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Your Videos Section */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-6">Your Videos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col justify-between aspect-[4/3] group hover:shadow-md transition-all cursor-pointer" onClick={() => alert('Video player coming soon!')}>
              <div className="flex justify-end">
                <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded border border-outline-variant">
                  Ready
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 font-medium">
                  <span>20:45</span>
                  <span>•</span>
                  <span>120MB</span>
                </div>
                <h3 className="text-on-surface font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">Getting Started with Our Platform</h3>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span>342 views</span>
                    <span>•</span>
                    <span>46 likes</span>
                  </div>
                  <Users size={14} className="text-outline" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col justify-between aspect-[4/3] group hover:shadow-md transition-all cursor-pointer" onClick={() => alert('Video player coming soon!')}>
              <div className="flex justify-end">
                <span className="bg-surface-container-high text-on-surface-variant text-xs font-semibold px-2.5 py-1 rounded border border-outline-variant">
                  Ready
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 font-medium">
                  <span>39:00</span>
                  <span>•</span>
                  <span>224MB</span>
                </div>
                <h3 className="text-on-surface font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">Advanced Features Walkthrough</h3>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span>156 views</span>
                    <span>•</span>
                    <span>28 likes</span>
                  </div>
                  <Lock size={14} className="text-outline" />
                </div>
              </div>
            </div>

            {/* Card 3 (Processing) */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 flex flex-col justify-between aspect-[4/3] relative overflow-hidden">
              <div className="absolute inset-0 bg-surface/40 z-0"></div>
              <div className="flex justify-end relative z-10">
                <span className="bg-primary-container text-on-primary-container text-xs font-semibold px-2.5 py-1 rounded border border-primary/20">
                  Processing
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <Loader2 size={32} className="text-primary animate-spin opacity-80" />
              </div>
              <div className="relative z-10 opacity-70">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 font-medium">
                  <span>31:30</span>
                  <span>•</span>
                  <span>435MB</span>
                </div>
                <h3 className="text-on-surface font-semibold text-lg leading-tight mb-2">Q4 Product Demo</h3>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span>0 views</span>
                    <span>•</span>
                    <span>0 likes</span>
                  </div>
                  <Users size={14} className="text-outline" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
