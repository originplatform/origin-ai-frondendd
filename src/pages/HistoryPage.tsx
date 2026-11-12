import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, RotateCcw, Search } from 'lucide-react';
import { api } from '../lib/api';
import type { Task } from '../types/api';
import { formatDuration, formatRelativeTime } from '../lib/utils';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, statusTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.tasks.list({
        search: search.trim() || undefined,
        status: statusFilter,
        page: 1,
        page_size: 50,
      });
      setTasks(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const handleRetry = async (taskId: string) => {
    setRetryingId(taskId);
    try {
      const retried = await api.tasks.retry(taskId);
      navigate(`/workspace?task=${retried.id}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task History"
        description={`${total} recorded tasks across your autonomous workspace.`}
      />

      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-origin-faint absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands or intents..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-origin-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-origin-border bg-white text-sm text-origin-ink focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="running">Running</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-origin-faint">Loading task history...</div>
        ) : tasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-origin-faint">
            No matching tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-origin-subtle border-b border-origin-border text-[11px] font-semibold uppercase tracking-wider text-origin-faint">
                  <th className="px-4 py-3">Command</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-origin-border text-sm">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-origin-subtle/50 transition-colors">
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-medium text-origin-ink truncate">{task.command}</div>
                      <div className="text-[11px] text-origin-faint">
                        {task.execution_plan.length} steps · {task.files.length} files
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-origin-muted">
                      {task.intent || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(task.status)} dot>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-origin-muted">
                      {formatDuration(task.duration_ms)}
                    </td>
                    <td className="px-4 py-3 text-xs text-origin-faint">
                      {formatRelativeTime(task.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {task.status === 'failed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={retryingId === task.id}
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => void handleRetry(task.id)}
                          >
                            Retry
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                          onClick={() => navigate(`/workspace?task=${task.id}`)}
                        >
                          Inspect
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
