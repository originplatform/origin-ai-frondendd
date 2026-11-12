import React, { useState } from 'react';
import { Check, Lock, ShieldAlert, X } from 'lucide-react';
import type { Approval } from '../../types/api';
import { Badge, statusTone } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const ApprovalPromptCard: React.FC<{
  approval: Approval;
  onDecide: (approvalId: string, decision: 'approve' | 'reject', note?: string) => Promise<void>;
}> = ({ approval, onDecide }) => {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  const handleAction = async (decision: 'approve' | 'reject') => {
    setBusy(decision);
    try {
      await onDecide(approval.id, decision, note.trim() || undefined);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card
      padding="md"
      className={
        approval.status === 'pending'
          ? 'border-amber-300 bg-amber-50/40'
          : 'border-origin-border bg-white'
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-origin-ink">{approval.title}</h4>
              <Badge tone={statusTone(approval.status)}>{approval.status}</Badge>
              <Badge tone="blue">{approval.service_name}</Badge>
            </div>
            <p className="text-xs text-origin-muted mt-1">{approval.description}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-origin-faint bg-white px-2 py-1 rounded border border-origin-border self-start">
          <Lock className="w-3 h-3" />
          {approval.action_hash.slice(0, 12)}…
        </div>
      </div>

      <div className="bg-white border border-origin-border rounded-lg p-3 mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-origin-faint mb-2">
          Exact Bound Action Parameters
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {Object.entries(approval.action_details).map(([key, val]) => (
            <div key={key} className="min-w-0">
              <dt className="font-medium text-origin-faint inline mr-1.5">{key}:</dt>
              <dd className="text-origin-ink inline break-words font-mono text-[11px]">
                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {approval.status === 'pending' ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional audit note..."
            className="flex-1 h-9 px-3 rounded-lg border border-origin-border bg-white text-xs text-origin-ink focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={busy === 'reject'}
              disabled={busy !== null}
              icon={<X className="w-3.5 h-3.5 text-red-600" />}
              onClick={() => void handleAction('reject')}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={busy === 'approve'}
              disabled={busy !== null}
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={() => void handleAction('approve')}
            >
              Approve & Execute
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-origin-faint">
          Decision: <strong className="text-origin-ink capitalize">{approval.status}</strong>
          {approval.decision_note ? ` — "${approval.decision_note}"` : ''}
        </div>
      )}
    </Card>
  );
};
