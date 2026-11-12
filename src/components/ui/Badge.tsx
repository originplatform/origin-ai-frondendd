import React from 'react';
import { cn } from '../../lib/utils';

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'slate';

export const Badge: React.FC<{
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}> = ({ children, tone = 'neutral', className, dot = false }) => {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-origin-surface text-origin-muted border-origin-border',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    red: 'bg-red-50 text-red-700 border-red-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors: Record<BadgeTone, string> = {
    neutral: 'bg-slate-400',
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    slate: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        tones[tone],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[tone])} />}
      {children}
    </span>
  );
};

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case 'completed':
    case 'approved':
    case 'active':
    case 'connected':
      return 'green';
    case 'running':
    case 'queued':
    case 'sandboxed':
      return 'blue';
    case 'awaiting_approval':
    case 'pending':
    case 'demo_mode':
    case 'demo_ready':
      return 'amber';
    case 'failed':
    case 'rejected':
    case 'expired':
    case 'disconnected':
      return 'red';
    default:
      return 'neutral';
  }
}
