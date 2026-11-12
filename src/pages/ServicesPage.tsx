import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Link2, Shield } from 'lucide-react';
import { api } from '../lib/api';
import type { ConnectedService } from '../types/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge, statusTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const SERVICE_CREDENTIAL_FIELDS: Record<string, Array<{ key: string; label: string; secret?: boolean; placeholder?: string }>> = {
  gemini: [
    { key: 'api_key', label: 'Gemini API Key', secret: true, placeholder: 'AIza...' },
  ],
  groq: [
    { key: 'api_key', label: 'Groq API Key', secret: true, placeholder: 'gsk_...' },
  ],
  email_smtp: [
    { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
    { key: 'smtp_port', label: 'SMTP Port', placeholder: '587' },
    { key: 'smtp_username', label: 'SMTP Username / Email', placeholder: 'you@company.com' },
    { key: 'smtp_password', label: 'SMTP App Password', secret: true, placeholder: '•••• ••••' },
  ],
  google_calendar: [
    { key: 'oauth_access_token', label: 'Google OAuth Access Token', secret: true, placeholder: 'ya29...' },
    { key: 'calendar_id', label: 'Calendar ID', placeholder: 'primary' },
  ],
  web_search: [
    { key: 'tavily_api_key', label: 'Tavily API Key (Optional)', secret: true, placeholder: 'tvly-...' },
  ],
  flight_booking: [
    { key: 'amadeus_api_key', label: 'Amadeus API Key', secret: true, placeholder: 'Client ID' },
    { key: 'amadeus_api_secret', label: 'Amadeus API Secret', secret: true, placeholder: 'Client Secret' },
  ],
  browser_automation: [
    { key: 'allowed_domains', label: 'Allowed Domains (comma-separated)', placeholder: 'example.com,wikipedia.org,python.org' },
  ],
};

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [accountLabel, setAccountLabel] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    const list = await api.services.list();
    setServices(list);
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const startConfigure = (svc: ConnectedService) => {
    setEditingKey(svc.service_key);
    setAccountLabel(svc.account_label || '');
    setFieldValues({});
    setFeedback(null);
  };

  const handleSave = async (svc: ConnectedService, mode: 'connected' | 'demo_mode' | 'disconnected') => {
    setSaving(true);
    setFeedback(null);
    try {
      const fields = SERVICE_CREDENTIAL_FIELDS[svc.service_key] || [];
      const credentials: Record<string, string> = {};
      const config: Record<string, string> = {};

      for (const f of fields) {
        const val = (fieldValues[f.key] || '').trim();
        if (!val) continue;
        if (f.secret) credentials[f.key] = val;
        else config[f.key] = val;
      }

      await api.services.configure(svc.service_key, {
        account_label: accountLabel.trim() || undefined,
        credentials,
        config,
        mode,
      });
      setEditingKey(null);
      setFeedback(`Updated ${svc.display_name} configuration.`);
      await loadServices();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Connected Services"
        description="Authorize integrations or enable safe sandbox demo mode. All secrets are encrypted at rest with Fernet AES-128 + HMAC."
      />

      {feedback && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((svc) => {
          const isEditing = editingKey === svc.service_key;
          const fields = SERVICE_CREDENTIAL_FIELDS[svc.service_key] || [];

          return (
            <Card key={svc.id} padding="md" className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-origin-subtle border border-origin-border flex items-center justify-center text-origin-ink mt-0.5">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-origin-ink">{svc.display_name}</h3>
                      <Badge tone="slate">{svc.category}</Badge>
                    </div>
                    <p className="text-xs text-origin-muted mt-1">{svc.description}</p>
                  </div>
                </div>
                <Badge tone={statusTone(svc.status)} dot>
                  {svc.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="text-xs bg-origin-subtle/70 border border-origin-border rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-origin-ink">
                  <Shield className="w-3.5 h-3.5 text-origin-accent" />
                  Setup & Credential Guide
                </div>
                <p className="text-origin-muted leading-relaxed">{svc.setup_instructions}</p>
                {svc.account_label && (
                  <p className="text-origin-ink pt-1">
                    Active Account: <span className="font-mono">{svc.account_label}</span>
                  </p>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2 border-t border-origin-border">
                  <Input
                    label="Account / Connection Label"
                    value={accountLabel}
                    onChange={(e) => setAccountLabel(e.target.value)}
                    placeholder="e.g., Work Gmail / Production Key"
                  />
                  {fields.map((f) => (
                    <Input
                      key={f.key}
                      label={f.label}
                      type={f.secret ? 'password' : 'text'}
                      placeholder={f.placeholder}
                      value={fieldValues[f.key] || ''}
                      onChange={(e) =>
                        setFieldValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                      }
                    />
                  ))}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingKey(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={saving}
                      onClick={() => void handleSave(svc, 'demo_mode')}
                    >
                      Use Safe Demo Mode
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      loading={saving}
                      icon={<KeyRound className="w-3.5 h-3.5" />}
                      onClick={() => void handleSave(svc, 'connected')}
                    >
                      Save Encrypted Credentials
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-origin-border">
                  <span className="text-[11px] text-origin-faint">
                    {Object.keys(svc.config_summary).length > 0
                      ? `Configured: ${Object.keys(svc.config_summary).join(', ')}`
                      : 'No custom credentials stored'}
                  </span>
                  <div className="flex items-center gap-2">
                    {svc.status !== 'disconnected' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleSave(svc, 'disconnected')}
                      >
                        Disconnect
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startConfigure(svc)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
