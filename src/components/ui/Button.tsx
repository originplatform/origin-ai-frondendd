import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const variants = {
    primary:
      'bg-origin-accent text-white hover:bg-origin-accent-hover border border-transparent shadow-subtle',
    secondary:
      'bg-origin-ink text-white hover:bg-slate-800 border border-transparent shadow-subtle',
    outline:
      'bg-white text-origin-ink hover:bg-origin-subtle border border-origin-border shadow-subtle',
    ghost: 'bg-transparent text-origin-muted hover:text-origin-ink hover:bg-origin-surface border border-transparent',
    danger:
      'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-subtle',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-9 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
