import React, { useEffect, useState } from 'react';
import { Bell, Cpu, Key, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { AuditLogEntry, UserSession } from '../types/api';
import { formatRelativeTime } from '../lib/utils';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [llmProvider, setLlmProvider] = useState(user?.llm_provider || 'local');
  const [notifApproval, setNotifApproval] = useState(
    user?.notification_preferences.email_on_approval ?? true
  );
  const [notifCompletion, setNotifCompletion] = useState(
    user?.notification_preferences.email_on_completion ?? true
  );
  const [notifToasts, setNotifToasts] = useState(
    user?.notification_preferences.live_toasts ?? true
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const loadSecurity = async () => {
      try {
        const [sessList, logs] = await Promise.all([
          api.auth.sessions(),
          api.auth.auditLogs(),
        ]);
        setSessions(sessList);
        setAuditLogs(logs);
      } catch {
        // ignore
      }
    };
    void loadSecurity();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await api.auth.updateProfile({
        full_name: fullName,
        llm_provider: llmProvider,
        notification_preferences: {
          email_on_approval: notifApproval,
          email_on_completion: notifCompletion,
          live_toasts: notifToasts,
        },
      });
      setUser(updated);
      setProfileMsg('Profile & AI provider preferences saved.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    setPwErr(null);
    try {
      await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setPwMsg('Password updated successfully.');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Failed to update password');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    await api.auth.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage profile, AI model providers, account security, sessions, and audit logs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & AI Provider */}
        <Card padding="md">
          <form onSubmit={(e) => void handleSaveProfile(e)} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-origin-border">
              <Cpu className="w-4 h-4 text-origin-accent" />
              <h2 className="text-sm font-semibold text-origin-ink">Profile & Model Provider</h2>
            </div>

            <Input label="Email" value={user?.email || ''} disabled />
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-origin-ink">
                Active AI Orchestration Provider
              </label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-origin-border bg-white text-sm text-origin-ink focus:outline-none"
              >
                <option value="local">Local Deterministic Orchestrator (Zero-Key Safe Mode)</option>
                <option value="gemini">Google Gemini API (Configure Key in Services)</option>
                <option value="groq">Groq API (Configure Key in Services)</option>
              </select>
              <p className="text-[11px] text-origin-faint">
                API keys are never sent to the browser and stay encrypted on the backend.
              </p>
            </div>

            <div className="pt-2 border-t border-origin-border space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-origin-ink">
                <Bell className="w-3.5 h-3.5 text-origin-muted" /> Notification Preferences
              </div>
              <label className="flex items-center justify-between text-xs text-origin-muted">
                <span>Notify on pending human approvals</span>
                <input
                  type="checkbox"
                  checked={notifApproval}
                  onChange={(e) => setNotifApproval(e.target.checked)}
                  className="rounded border-origin-border text-origin-accent"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-origin-muted">
                <span>Notify when long-running tasks complete</span>
                <input
                  type="checkbox"
                  checked={notifCompletion}
                  onChange={(e) => setNotifCompletion(e.target.checked)}
                  className="rounded border-origin-border text-origin-accent"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-origin-muted">
                <span>Show live agent execution updates</span>
                <input
                  type="checkbox"
                  checked={notifToasts}
                  onChange={(e) => setNotifToasts(e.target.checked)}
                  className="rounded border-origin-border text-origin-accent"
                />
              </label>
            </div>

            {profileMsg && <p className="text-xs text-emerald-700">{profileMsg}</p>}
            <Button type="submit" loading={savingProfile}>
              Save Changes
            </Button>
          </form>
        </Card>

        {/* Password & Security */}
        <Card padding="md">
          <form onSubmit={(e) => void handleChangePassword(e)} className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-origin-border">
              <Key className="w-4 h-4 text-origin-accent" />
              <h2 className="text-sm font-semibold text-origin-ink">Account Security</h2>
            </div>

            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {pwErr && <p className="text-xs text-red-600">{pwErr}</p>}
            {pwMsg && <p className="text-xs text-emerald-700">{pwMsg}</p>}

            <Button type="submit" variant="secondary">
              Update Password
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-origin-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-origin-ink mb-3">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Active Sessions ({sessions.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="p-2.5 rounded-lg border border-origin-border bg-origin-subtle/50 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-origin-ink truncate">
                      {s.ip_address || 'Local Session'}{' '}
                      {s.is_current && <Badge tone="green">Current</Badge>}
                    </div>
                    <div className="text-[11px] text-origin-faint truncate">
                      Started {formatRelativeTime(s.created_at)}
                    </div>
                  </div>
                  {!s.is_current && (
                    <button
                      type="button"
                      onClick={() => void handleRevokeSession(s.id)}
                      className="p-1.5 text-origin-faint hover:text-red-600 rounded"
                      title="Revoke session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Privacy Audit Log */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-origin-ink">Security & Privacy Audit Log</h2>
            <p className="text-xs text-origin-faint">
              Immutable trace of logins, approvals, file accesses, and prompt-injection blocks.
            </p>
          </div>
          <Badge tone="slate">{auditLogs.length} recent events</Badge>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-origin-faint py-4">No audit entries recorded yet.</p>
        ) : (
          <div className="divide-y divide-origin-border text-xs max-h-72 overflow-y-auto">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="font-mono font-medium text-origin-ink">{entry.action}</span>
                  <span className="text-origin-faint ml-2">
                    ({entry.resource_type}
                    {entry.resource_id ? `:${entry.resource_id.slice(0, 8)}` : ''})
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge tone={entry.severity === 'security' ? 'red' : entry.severity === 'warning' ? 'amber' : 'neutral'}>
                    {entry.severity}
                  </Badge>
                  <span className="text-origin-faint">{formatRelativeTime(entry.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
