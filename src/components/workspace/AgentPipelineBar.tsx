import React from 'react';
import { Check, CircleDot, Loader2, ShieldAlert } from 'lucide-react';
import type { AgentExecution, TaskStatus } from '../../types/api';
import { cn } from '../../lib/utils';

const PIPELINE_AGENTS = [
  { key: 'intent_agent', label: 'Intent' },
  { key: 'planner_agent', label: 'Planner' },
  { key: 'policy_agent', label: 'Policy' },
  { key: 'router_agent', label: 'Router' },
  { key: 'execution_agent', label: 'Execution' },
  { key: 'verification_agent', label: 'Verification' },
  { key: 'recovery_agent', label: 'Recovery' },
  { key: 'response_agent', label: 'Response' },
];

export const AgentPipelineBar: React.FC<{
  executions: AgentExecution[];
  taskStatus: TaskStatus;
  activeAgent?: string | null;
}> = ({ executions, taskStatus, activeAgent }) => {
  const latestByAgent = new Map<string, AgentExecution>();
  for (const ex of executions) {
    latestByAgent.set(ex.agent_name, ex);
  }

  return (
    <div className="bg-white border border-origin-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-origin-faint">
          LangGraph Orchestration Pipeline
        </h3>
        <span className="text-xs text-origin-muted capitalize">
          State: <strong className="text-origin-ink">{taskStatus.replace('_', ' ')}</strong>
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {PIPELINE_AGENTS.map((agent) => {
          const exec = latestByAgent.get(agent.key);
          const isActive = activeAgent === agent.key || exec?.status === 'running';
          const isDone = exec?.status === 'completed';
          const isFailed = exec?.status === 'failed';
          const isBlocked = taskStatus === 'awaiting_approval' && agent.key === 'policy_agent';

          return (
            <div
              key={agent.key}
              className={cn(
                'px-2.5 py-2 rounded-lg border text-xs transition-all',
                isActive && 'border-origin-accent bg-origin-accent-soft text-origin-accent',
                isDone && !isActive && 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
                isFailed && 'border-red-200 bg-red-50 text-red-700',
                isBlocked && 'border-amber-200 bg-amber-50 text-amber-800',
                !isActive &&
                  !isDone &&
                  !isFailed &&
                  !isBlocked &&
                  'border-origin-border bg-origin-subtle/50 text-origin-faint'
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium truncate">{agent.label}</span>
                {isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                ) : isBlocked ? (
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                ) : isDone ? (
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <CircleDot className="w-3 h-3 opacity-40 flex-shrink-0" />
                )}
              </div>
              <div className="text-[10px] opacity-80 truncate mt-0.5">
                {exec?.duration_ms ? `${exec.duration_ms}ms` : isActive ? 'Active' : 'Standby'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
