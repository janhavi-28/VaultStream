import React from 'react';
import { PageSkeleton } from '../ui/Skeleton';

const SuspenseFallback = () => (
  <div className="mx-auto w-full max-w-7xl px-4 py-6" role="status" aria-live="polite" aria-label="Loading page content">
    <PageSkeleton />
  </div>
);

export default SuspenseFallback;
