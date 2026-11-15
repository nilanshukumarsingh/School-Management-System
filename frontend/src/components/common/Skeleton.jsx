import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200/80 rounded-lg ${className}`} />;
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
};
