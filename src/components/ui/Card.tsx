import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { padding?: 'none' | 'sm' | 'md' | 'lg' }
> = ({ children, className, padding = 'md', ...props }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'bg-white border border-origin-border rounded-xl shadow-card',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
