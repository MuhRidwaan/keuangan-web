'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    neutral: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
