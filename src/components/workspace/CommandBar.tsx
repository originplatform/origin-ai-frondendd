import React, { useRef, useState } from 'react';
import { ArrowUp, FileText, Loader2, Paperclip, Sparkles, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { GeneratedFile } from '../../types/api';
import { formatBytes } from '../../lib/utils';
import { Button } from '../ui/Button';

interface CommandBarProps {
  onSubmit: (command: string, attachedFileIds: string[]) => Promise<void>;
  placeholder?: string;
  initialValue?: string;
  compact?: boolean;
  submitting?: boolean;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onSubmit,
  placeholder = 'Command ORIGIN AI... e.g., "Research AI internships, summarize top 5, and generate a PDF report"',
  initialValue = '',
  compact = false,
  submitting = false,
}) => {
  const [command, setCommand] = useState(initialValue);
  const [attachedFiles, setAttachedFiles] = useState<GeneratedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await api.files.upload(file);
      setAttachedFiles((prev) => [...prev, uploaded]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || submitting) return;
    const cmd = command.trim();
    const ids = attachedFiles.map((f) => f.id);
    await onSubmit(cmd, ids);
    setCommand('');
    setAttachedFiles([]);
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="bg-white border border-origin-border rounded-2xl shadow-card focus-within:border-origin-accent focus-within:ring-2 focus-within:ring-blue-500/10 transition-all"
    >
      <div className={compact ? 'p-3' : 'p-4'}>
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
          rows={compact ? 2 : 3}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent text-sm text-origin-ink placeholder:text-slate-400 focus:outline-none leading-relaxed"
        />

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-origin-border/60">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-origin-subtle border border-origin-border text-xs text-origin-ink"
              >
                <FileText className="w-3.5 h-3.5 text-origin-accent" />
                <span className="max-w-[180px] truncate font-medium">{file.filename}</span>
                <span className="text-origin-faint">({formatBytes(file.size_bytes)})</span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachedFiles((prev) => prev.filter((item) => item.id !== file.id))
                  }
                  className="text-origin-faint hover:text-red-600 ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
      </div>

      <div className="px-4 py-2.5 bg-origin-subtle/70 border-t border-origin-border rounded-b-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.xlsx,.xls,.txt,.md"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-origin-muted hover:text-origin-ink hover:bg-white border border-transparent hover:border-origin-border transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Paperclip className="w-3.5 h-3.5" />
            )}
            Attach PDF / CSV / Excel
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-origin-faint">
            <Sparkles className="w-3 h-3 text-origin-accent" />
            Enter to execute · Shift+Enter for newline
          </span>
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={!command.trim() || submitting || uploading}
          loading={submitting}
          icon={<ArrowUp className="w-3.5 h-3.5" />}
        >
          Execute
        </Button>
      </div>
    </form>
  );
};
