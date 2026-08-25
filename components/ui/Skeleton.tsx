'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export const PageSkeleton: React.FC<{ title?: string }> = ({ title = 'Memuat Data...' }) => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-32 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-3 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded" />
          </Card>
        ))}
      </div>

      {/* Large Content Card Skeleton */}
      <Card className="h-80 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
        <p className="text-sm font-semibold text-slate-400">{title}</p>
      </Card>
    </div>
  );
};