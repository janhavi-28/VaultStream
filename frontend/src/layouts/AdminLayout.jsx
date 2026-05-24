import React from 'react';
import DashboardLayout from './DashboardLayout';
import { Home, Users, Building, ShieldAlert, Video, UploadCloud } from 'lucide-react';

const AdminLayout = () => {
  const navigationParams = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Upload Video', path: '/admin/upload', icon: UploadCloud },
    { name: 'Video Library', path: '/admin/videos', icon: Video },
    { name: 'Moderation', path: '/admin/moderation', icon: ShieldAlert },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Tenants', path: '/admin/tenants', icon: Building }
  ];

  return <DashboardLayout navigationParams={navigationParams} />;
};

export default AdminLayout;
