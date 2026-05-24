import React from 'react';
import { Wrench } from 'lucide-react';
import EmptyState from '../components/feedback/EmptyState';

const MaintenanceMode = () => (
  <div className="min-h-screen bg-slate-50 p-4">
    <div className="mx-auto max-w-3xl pt-16">
      <EmptyState icon={Wrench} title="Maintenance mode" description="The platform is temporarily unavailable while we complete scheduled maintenance." tone="amber" />
    </div>
  </div>
);

export default MaintenanceMode;
