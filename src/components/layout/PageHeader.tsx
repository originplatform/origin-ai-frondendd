import React from 'react';

export const PageHeader: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-origin-border mb-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-origin-ink">{title}</h1>
        {description && <p className="text-sm text-origin-muted mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-shrink-0">{actions}</div>}
    </div>
  );
};
