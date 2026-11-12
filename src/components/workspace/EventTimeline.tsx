import React from 'react';
import { Activity, Terminal } from 'lucide-react';
import type { TaskEvent, ToolExecution } from '../../types/api';
import { formatDuration } from '../../lib/utils';
import { Badge, statusTone } from '../ui/Badge';
import { Card } from '../ui/Card';

export const EventTimeline: React.FC<{
  liveEvents: TaskEvent[];
  toolExecutions: ToolExecution[];
}> = ({ liveEvents, toolExecutions }) => {
  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-origin-accent" />
          <h3 className="text-sm font-semibold text-origin-ink">Live Execution Timeline</h3>
        </div>
        <span className="text-xs text-origin-faint">{liveEvents.length} events</span>
      </div>

      {liveEvents.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 mb-4">
          {liveEvents.map((ev, idx) => (
            <div
              key={`${ev.timestamp}-${idx}`}
              className="flex items-start gap-2.5 text-xs py-1.5 border-b border-origin-border/50 last:border-0"
            >
              <span className="font-mono text-[10px] text-origin-faint mt-0.5 flex-shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-origin-ink">
                  {ev.agent_name ? `[${ev.agent_name}] ` : ''}
                </span>
                <span className="text-origin-muted">{ev.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-origin-border">
        <div className="flex items-center gap-2 mb-2.5">
          <Terminal className="w-3.5 h-3.5 text-origin-muted" />
          <span className="text-xs font-semibold text-origin-ink">Tool Audit Trace</span>
        </div>
        {toolExecutions.length === 0 ? (
          <p className="text-xs text-origin-faint">No tool invocations recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {toolExecutions.map((tool) => (
              <div
                key={tool.id}
                className="p-2.5 rounded-lg bg-origin-subtle border border-origin-border text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium text-origin-ink">{tool.tool_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-origin-faint">
                      {formatDuration(tool.duration_ms)}
                    </span>
                    <Badge tone={statusTone(tool.status)}>{tool.status}</Badge>
                  </div>
                </div>
                {tool.error && <p className="text-red-600 mt-1">{tool.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
