import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Home, UploadCloud, Film } from 'lucide-react';

const EditorLayout = () => {
  const navigationParams = [
    { name: 'Dashboard', path: '/editor/dashboard', icon: Home },
    { name: 'Upload Video', path: '/editor/upload', icon: UploadCloud },
    { name: 'My Videos', path: '/editor/library', icon: Film }
  ];

  return <DashboardLayout navigationParams={navigationParams} />;
};

export default EditorLayout;
