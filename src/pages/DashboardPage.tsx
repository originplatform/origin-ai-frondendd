import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Link2,
  Mail,
  Plane,
  ShieldAlert,
  Sparkles,
  Table2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { Approval, ConnectedService, Task } from '../types/api';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { CommandBar } from '../components/workspace/CommandBar';
import { Badge, statusTone } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const SUGGESTED_COMMANDS = [
  {
    title: 'Draft Leave Letter (TXT)',
    icon: FileText,
    command:
      'Create a professional leave letter for 3 days starting next Monday due to a family commitment and save it as a TXT file.',
  },
  {
    title: 'Research & PDF Report',
    icon: Globe,
    command:
      'Research top AI engineering internships for 2026 and generate a structured professional PDF report with source references.',
  },
  {
    title: 'Analyze Dataset & Charts',
    icon: Table2,
    command:
      'Analyze my uploaded CSV dataset, inspect missing values and summary statistics, generate visualizations, and export a report.',
  },
  {
    title: 'Compare Flights (HITL)',
    icon: Plane,
    command:
      'Find available flights from San Francisco to New York next month under $450, compare ticket options, and prepare booking summary.',
  },
  {
    title: 'Draft & Send Email',
    icon: Mail,
    command:
      'Draft a concise project status update email to engineering@company.com summarizing our Q4 milestone progress and prepare it for sending.',
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([]);
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [tasksRes, approvalsRes, servicesRes] = await Promise.all([
          api.tasks.list({ page: 1, page_size: 8 }),
          api.approvals.list('pending'),
          api.services.list(),
        ]);
        setRecentTasks(tasksRes.items);
        setTotalTasks(tasksRes.total);
        setPendingApprovals(approvalsRes);
        setServices(servicesRes);
      } catch {
        // silent fallback if partial load fails
      }
    };
    void loadDashboard();
  }, []);

  const handleRunCommand = async (command: string, attachedFileIds: string[]) => {
    setSubmitting(true);
    try {
      const created = await api.tasks.create({
        command,
        attached_file_ids: attachedFileIds,
      });
      navigate(`/workspace?task=${created.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = recentTasks.filter((t) => t.status === 'completed').length;
  const activeCount = recentTasks.filter(
    (t) => t.status === 'running' || t.status === 'queued'
  ).length;
  const connectedCount = services.filter((s) => s.status !== 'disconnected').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Hero & Command Center */}
      <section className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-origin-accent-soft text-origin-accent text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              ORIGIN AI · Autonomous Task Execution
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-origin-ink">
              Welcome back, {user?.full_name.split(' ')[0] || 'Operator'}
            </h1>
            <p className="text-sm text-origin-muted mt-1">
              Issue a natural-language command. Specialized agents will plan, verify, ask approval when required, and deliver results.
            </p>
          </div>
        </div>

        <CommandBar onSubmit={handleRunCommand} submitting={submitting} />

        {/* Suggested Commands */}
        <div>
          <div className="text-xs font-medium text-origin-faint mb-2.5">Suggested Workflows</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {SUGGESTED_COMMANDS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleRunCommand(item.command, [])}
                  className="text-left p-3 rounded-xl bg-white border border-origin-border hover:border-origin-accent hover:shadow-card transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-origin-accent" />
                    <ArrowRight className="w-3.5 h-3.5 text-origin-faint group-hover:text-origin-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-xs font-semibold text-origin-ink">{item.title}</div>
                  <p className="text-[11px] text-origin-faint line-clamp-2 mt-0.5">
                    {item.command}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* KPI Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-origin-faint">
            <span>Total Tasks</span>
            <Bot className="w-4 h-4 text-origin-accent" />
          </div>
          <div className="text-2xl font-semibold text-origin-ink mt-2">{totalTasks}</div>
          <div className="text-[11px] text-origin-faint mt-1">Isolated to your workspace</div>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-origin-faint">
            <span>Completed (Recent)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-semibold text-origin-ink mt-2">{completedCount}</div>
          <div className="text-[11px] text-origin-faint mt-1">{activeCount} currently active</div>
        </Card>

        <Card
          padding="md"
          className="cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => navigate('/approvals')}
        >
          <div className="flex items-center justify-between text-xs text-origin-faint">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-semibold text-origin-ink mt-2">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-origin-faint mt-1">Click to review gates</div>
        </Card>

        <Card
          padding="md"
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => navigate('/services')}
        >
          <div className="flex items-center justify-between text-xs text-origin-faint">
            <span>Connected Tools</span>
            <Link2 className="w-4 h-4 text-origin-accent" />
          </div>
          <div className="text-2xl font-semibold text-origin-ink mt-2">{connectedCount}</div>
          <div className="text-[11px] text-origin-faint mt-1">Active or sandbox ready</div>
        </Card>
      </section>

      {/* Recent Tasks + Connected Tools Quick Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-origin-ink">Recent Tasks</h2>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="text-xs font-medium text-origin-accent hover:underline"
            >
              View all history
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="py-10 text-center">
              <Clock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-origin-faint">
                No tasks executed yet. Run a command above to launch your first agent workflow.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-origin-border">
              {recentTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/workspace?task=${task.id}`)}
                  className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-origin-subtle/70 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-origin-ink truncate">
                      {task.command}
                    </div>
                    <div className="text-xs text-origin-faint mt-0.5 flex items-center gap-2">
                      <span>{task.intent || 'multi_agent_task'}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(task.created_at)}</span>
                      {task.duration_ms != null && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{formatDuration(task.duration_ms)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge tone={statusTone(task.status)} dot>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-origin-ink">Integrations & Quick Access</h2>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="text-xs font-medium text-origin-accent hover:underline"
            >
              Configure
            </button>
          </div>
          <div className="space-y-2.5">
            {services.slice(0, 5).map((svc) => (
              <div
                key={svc.id}
                className="p-2.5 rounded-lg border border-origin-border bg-origin-subtle/40 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-origin-ink truncate">
                    {svc.display_name}
                  </div>
                  <div className="text-[11px] text-origin-faint truncate">{svc.category}</div>
                </div>
                <Badge tone={statusTone(svc.status)}>{svc.status.replace('_', ' ')}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-origin-border grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigate('/workspace')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-origin-subtle hover:bg-origin-surface text-origin-ink border border-origin-border text-center"
            >
              Open Workspace
            </button>
            <button
              type="button"
              onClick={() => navigate('/directory')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-origin-subtle hover:bg-origin-surface text-origin-ink border border-origin-border text-center"
            >
              Agent Directory
            </button>
          </div>
        </Card>
      </section>
    </motion.div>
  );
};
