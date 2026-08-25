'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  gradientHover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, gradientHover = false, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 transition-all duration-300',
        gradientHover && 'hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
