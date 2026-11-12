import React, { useEffect, useState } from 'react';
import { Bot, Lock, ShieldCheck, Wrench } from 'lucide-react';
import { api } from '../lib/api';
import type { AgentMetadata } from '../types/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, statusTone } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const DirectoryPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.agents.list();
        setAgents(list);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const orchestrationAgents = agents.filter((a) => a.category === 'orchestration');
  const functionalAgents = agents.filter((a) => a.category === 'functional');

  const renderGrid = (items: AgentMetadata[], icon: 'bot' | 'tool') => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((agent) => (
        <Card key={agent.id} padding="md" className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-origin-accent-soft text-origin-accent flex items-center justify-center">
                  {icon === 'bot' ? <Bot className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-origin-ink">{agent.name}</h3>
                  <span className="text-[11px] font-mono text-origin-faint">{agent.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {agent.requires_approval && (
                  <Badge tone="amber">
                    <Lock className="w-3 h-3" /> HITL
                  </Badge>
                )}
                <Badge tone={statusTone(agent.status)} dot>
                  {agent.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-origin-muted leading-relaxed">{agent.description}</p>

            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-origin-faint mb-1.5">
                Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 rounded-md bg-origin-subtle border border-origin-border text-[11px] text-origin-ink"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-origin-border flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] text-origin-faint">Permissions:</span>
            {agent.permissions.map((perm) => (
              <code
                key={perm}
                className="text-[11px] font-mono bg-origin-surface px-1.5 py-0.5 rounded text-origin-muted"
              >
                {perm}
              </code>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agent Directory"
        description="Inspect LangGraph orchestration nodes and allowlisted functional tool modules."
      />

      {loading ? (
        <Card padding="lg" className="text-center text-xs text-origin-faint">
          Loading agent registry...
        </Card>
      ) : (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-origin-ink">
                Core Orchestration Agents ({orchestrationAgents.length})
              </h2>
              <p className="text-xs text-origin-faint">
                Stateful LangGraph nodes responsible for planning, policy checks, routing, verification, and recovery.
              </p>
            </div>
            {renderGrid(orchestrationAgents, 'bot')}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-origin-ink">
                Functional Tool Modules ({functionalAgents.length})
              </h2>
              <p className="text-xs text-origin-faint">
                Sandboxed digital capabilities with Pydantic validation and per-user isolation.
              </p>
            </div>
            {renderGrid(functionalAgents, 'tool')}
          </section>
        </>
      )}
    </div>
  );
};
