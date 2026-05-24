import React from 'react';

const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;

export const PageSkeleton = () => (
  <div className="space-y-5">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-48 w-full rounded-2xl" />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Skeleton key={idx} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

export default Skeleton;
