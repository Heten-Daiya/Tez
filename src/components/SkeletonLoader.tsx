import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

export const NoteCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-hidden">
    <div className="flex justify-between items-center mb-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="flex space-x-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-2" />
    <Skeleton className="h-4 w-4/6 mb-4" />
    <div className="flex justify-between items-center mt-2">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
    </div>
  </div>
);

export const TasksSkeleton: React.FC = () => (
  <div className="mt-4 space-y-2">
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-6 w-full" />
  </div>
);