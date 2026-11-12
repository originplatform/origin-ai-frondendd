import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || React.useId();
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-origin-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full h-9 px-3 rounded-lg border bg-white text-sm text-origin-ink placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-origin-accent transition-colors',
          error ? 'border-red-400' : 'border-origin-border',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-origin-faint">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
