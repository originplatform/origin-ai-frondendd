import React from 'react';
import { CheckCircle2, Clock, Lock, PlayCircle, ShieldAlert, XCircle } from 'lucide-react';
import type { PlanStep } from '../../types/api';
import { formatDuration } from '../../lib/utils';
import { Badge, statusTone } from '../ui/Badge';
import { Card } from '../ui/Card';

export const ExecutionPlanCard: React.FC<{ steps: PlanStep[] }> = ({ steps }) => {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-origin-ink">Execution Plan</h3>
          <p className="text-xs text-origin-faint mt-0.5">
            Structured ordered steps verified by Policy Agent
          </p>
        </div>
        <Badge tone="slate">{steps.length} steps</Badge>
      </div>

      {steps.length === 0 ? (
        <div className="py-6 text-center text-xs text-origin-faint">
          Waiting for Planner Agent to emit steps...
        </div>
      ) : (
        <div className="space-y-2.5">
          {steps.map((step, idx) => {
            const Icon =
              step.status === 'completed'
                ? CheckCircle2
                : step.status === 'failed' || step.status === 'rejected'
                ? XCircle
                : step.status === 'awaiting_approval'
                ? ShieldAlert
                : step.status === 'running'
                ? PlayCircle
                : Clock;

            const iconColor =
              step.status === 'completed'
                ? 'text-emerald-600'
                : step.status === 'failed' || step.status === 'rejected'
                ? 'text-red-600'
                : step.status === 'awaiting_approval'
                ? 'text-amber-600'
                : step.status === 'running'
                ? 'text-origin-accent'
                : 'text-slate-400';

            return (
              <div
                key={step.step_id}
                className="p-3 rounded-lg border border-origin-border bg-origin-subtle/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-origin-ink">
                          {idx + 1}. {step.title}
                        </span>
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white border border-origin-border text-origin-muted">
                          {step.tool_name}
                        </span>
                        {step.requires_approval && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Lock className="w-2.5 h-2.5" /> Approval Gate
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-origin-muted mt-1">{step.description}</p>
                      {step.result_summary && (
                        <p className="text-xs text-emerald-700 mt-1.5 bg-emerald-50/70 px-2 py-1 rounded border border-emerald-200/70">
                          {step.result_summary}
                        </p>
                      )}
                      {step.error && (
                        <p className="text-xs text-red-700 mt-1.5 bg-red-50 px-2 py-1 rounded border border-red-200">
                          {step.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge tone={statusTone(step.status)}>{step.status.replace('_', ' ')}</Badge>
                    {step.duration_ms != null && (
                      <span className="text-[11px] font-mono text-origin-faint">
                        {formatDuration(step.duration_ms)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
