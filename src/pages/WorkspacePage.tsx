import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { Task, TaskEvent } from '../types/api';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, statusTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';
import { CommandBar } from '../components/workspace/CommandBar';
import { AgentPipelineBar } from '../components/workspace/AgentPipelineBar';
import { ExecutionPlanCard } from '../components/workspace/ExecutionPlanCard';
import { EventTimeline } from '../components/workspace/EventTimeline';
import { ApprovalPromptCard } from '../components/workspace/ApprovalPromptCard';
import { GeneratedFilesList } from '../components/workspace/GeneratedFilesList';

export const WorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTaskId = searchParams.get('task');

  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [liveEvents, setLiveEvents] = useState<TaskEvent[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRecent = useCallback(async () => {
    try {
      const res = await api.tasks.list({ page: 1, page_size: 12 });
      setRecentTasks(res.items);
      if (!selectedTaskId && res.items.length > 0) {
        setSearchParams({ task: res.items[0].id }, { replace: true });
      }
    } catch {
      // ignore
    }
  }, [selectedTaskId, setSearchParams]);

  const loadTask = useCallback(async (taskId: string) => {
    try {
      const task = await api.tasks.get(taskId);
      setActiveTask(task);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    if (!selectedTaskId) {
      setActiveTask(null);
      setLiveEvents([]);
      return;
    }
    setLiveEvents([]);
    setActiveAgent(null);
    void loadTask(selectedTaskId);

    const unsubscribe = api.tasks.subscribeEvents(selectedTaskId, (ev) => {
      setLiveEvents((prev) => [...prev, ev]);
      if (ev.agent_name) setActiveAgent(ev.agent_name);
      if (
        ['plan_created', 'step_started', 'step_completed', 'step_failed', 'approval_required', 'approval_resolved', 'task_completed', 'task_failed'].includes(
          ev.event_type
        )
      ) {
        void loadTask(selectedTaskId);
      }
      if (ev.event_type === 'task_completed' || ev.event_type === 'task_failed') {
        setActiveAgent(null);
        void loadRecent();
      }
    });

    const pollInterval = setInterval(() => {
      void loadTask(selectedTaskId);
    }, 3500);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [selectedTaskId, loadTask, loadRecent]);

  const handleCommand = async (command: string, attachedFileIds: string[]) => {
    setSubmitting(true);
    try {
      const created = await api.tasks.create({
        command,
        attached_file_ids: attachedFileIds,
      });
      setActiveTask(created);
      setLiveEvents([]);
      setSearchParams({ task: created.id });
      void loadRecent();
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovalDecision = async (
    approvalId: string,
    decision: 'approve' | 'reject',
    note?: string
  ) => {
    await api.approvals.decide(approvalId, { decision, note });
    if (selectedTaskId) {
      await loadTask(selectedTaskId);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent Workspace"
        description="Live LangGraph orchestration, tool timelines, approvals, and generated artifacts."
        actions={
          activeTask && (
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => void loadTask(activeTask.id)}
            >
              Refresh
            </Button>
          )
        }
      />

      <CommandBar onSubmit={handleCommand} compact submitting={submitting} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Task Switcher */}
        <Card padding="sm" className="lg:col-span-3">
          <div className="text-xs font-semibold text-origin-ink px-2 py-1.5 border-b border-origin-border mb-2">
            Workspace Threads
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-xs text-origin-faint p-3 text-center">No tasks yet.</p>
          ) : (
            <div className="space-y-1 max-h-[540px] overflow-y-auto">
              {recentTasks.map((t) => {
                const isSelected = t.id === selectedTaskId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSearchParams({ task: t.id })}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-origin-accent-soft border-blue-200 text-origin-ink'
                        : 'bg-white border-transparent hover:bg-origin-subtle text-origin-muted'
                    }`}
                  >
                    <div className="text-xs font-medium text-origin-ink line-clamp-2">
                      {t.command}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-origin-faint">
                        {formatRelativeTime(t.created_at)}
                      </span>
                      <Badge tone={statusTone(t.status)}>{t.status.replace('_', ' ')}</Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right Execution Canvas */}
        <div className="lg:col-span-9 space-y-5">
          {!activeTask ? (
            <Card padding="lg" className="text-center py-16">
              <Sparkles className="w-7 h-7 text-origin-accent mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-origin-ink">Ready for Execution</h3>
              <p className="text-xs text-origin-muted mt-1 max-w-md mx-auto">
                Enter a command above or pick a recent workflow thread to inspect the multi-agent execution plan and tool timeline.
              </p>
            </Card>
          ) : (
            <>
              {/* Task Header Card */}
              <Card padding="md">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge tone={statusTone(activeTask.status)} dot>
                        {activeTask.status.replace('_', ' ')}
                      </Badge>
                      {activeTask.intent && (
                        <span className="text-xs font-mono text-origin-faint">
                          intent: {activeTask.intent}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-origin-ink">
                      {activeTask.command}
                    </h2>
                  </div>
                  <div className="text-xs text-origin-faint font-mono flex-shrink-0">
                    Duration: {formatDuration(activeTask.duration_ms)}
                  </div>
                </div>
              </Card>

              {/* 8-Agent Pipeline */}
              <AgentPipelineBar
                executions={activeTask.agent_executions}
                taskStatus={activeTask.status}
                activeAgent={activeAgent}
              />

              {/* Approval Gates */}
              {activeTask.approvals.length > 0 && (
                <div className="space-y-3">
                  {activeTask.approvals.map((app) => (
                    <ApprovalPromptCard
                      key={app.id}
                      approval={app}
                      onDecide={handleApprovalDecision}
                    />
                  ))}
                </div>
              )}

              {/* Execution Plan + Live Timeline */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <ExecutionPlanCard steps={activeTask.execution_plan} />
                <EventTimeline
                  liveEvents={liveEvents}
                  toolExecutions={activeTask.tool_executions}
                />
              </div>

              {/* Final Response */}
              {activeTask.final_response && (
                <Card padding="lg">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-origin-border">
                    <h3 className="text-sm font-semibold text-origin-ink">Final Output</h3>
                    <span className="text-[11px] font-mono text-origin-faint">
                      Verified by Verification & Response Agents
                    </span>
                  </div>
                  <MarkdownRenderer content={activeTask.final_response} />
                </Card>
              )}

              {activeTask.error_message && (
                <Card padding="md" className="border-red-200 bg-red-50/60">
                  <h3 className="text-xs font-semibold text-red-800 mb-1">Execution Error</h3>
                  <p className="text-xs text-red-700">{activeTask.error_message}</p>
                </Card>
              )}

              {/* Files & Downloads */}
              <GeneratedFilesList files={activeTask.files} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
