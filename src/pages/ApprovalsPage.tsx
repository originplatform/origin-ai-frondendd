import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import type { Approval } from '../types/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { ApprovalPromptCard } from '../components/workspace/ApprovalPromptCard';

export const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.approvals.list('all');
      setApprovals(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const handleDecide = async (
    approvalId: string,
    decision: 'approve' | 'reject',
    note?: string
  ) => {
    await api.approvals.decide(approvalId, { decision, note });
    await loadApprovals();
  };

  const pendingList = approvals.filter((a) => a.status === 'pending');
  const historyList = approvals.filter((a) => a.status !== 'pending');
  const activeList = tab === 'pending' ? pendingList : historyList;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Approvals"
        description="Sensitive operations require explicit confirmation bound to exact action parameters."
      />

      <div className="inline-flex rounded-lg bg-white border border-origin-border p-1">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === 'pending'
              ? 'bg-origin-ink text-white'
              : 'text-origin-muted hover:text-origin-ink'
          }`}
        >
          Pending ({pendingList.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
            tab === 'history'
              ? 'bg-origin-ink text-white'
              : 'text-origin-muted hover:text-origin-ink'
          }`}
        >
          Approval History ({historyList.length})
        </button>
      </div>

      {loading ? (
        <Card padding="lg" className="text-center text-xs text-origin-faint">
          Loading approval requests...
        </Card>
      ) : activeList.length === 0 ? (
        <Card padding="lg" className="text-center py-14">
          {tab === 'pending' ? (
            <>
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-2.5" />
              <h3 className="text-sm font-semibold text-origin-ink">No Pending Approvals</h3>
              <p className="text-xs text-origin-muted mt-1">
                All sensitive actions have been reviewed. New email sends, bookings, calendar mutations, or form submissions will appear here.
              </p>
            </>
          ) : (
            <>
              <ShieldAlert className="w-7 h-7 text-slate-300 mx-auto mb-2.5" />
              <h3 className="text-sm font-semibold text-origin-ink">No Approval History Yet</h3>
              <p className="text-xs text-origin-muted mt-1">
                Completed approval decisions are permanently audited here.
              </p>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {activeList.map((approval) => (
            <div key={approval.id} className="space-y-1.5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/workspace?task=${approval.task_id}`)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-origin-accent hover:underline"
                >
                  Inspect parent task <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <ApprovalPromptCard approval={approval} onDecide={handleDecide} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
