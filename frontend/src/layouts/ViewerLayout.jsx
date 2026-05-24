import React from 'react';
import DashboardLayout from './DashboardLayout';
import { PlaySquare, HelpCircle } from 'lucide-react';

const ViewerLayout = () => {
  const navigationParams = [
    { name: 'Watch', path: '/viewer/dashboard', icon: PlaySquare },
    { name: 'Help', path: '/viewer/help', icon: HelpCircle }
  ];

  return <DashboardLayout navigationParams={navigationParams} />;
};

export default ViewerLayout;
