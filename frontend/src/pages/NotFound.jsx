import React from 'react';
import { Compass } from 'lucide-react';
import EmptyState from '../components/feedback/EmptyState';

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 p-4">
    <div className="mx-auto max-w-3xl pt-16">
      <EmptyState icon={Compass} title="404 page not found" description="The page you requested does not exist or has been moved." actionLabel="Return home" actionTo="/" tone="sky" />
    </div>
  </div>
);

export default NotFound;
