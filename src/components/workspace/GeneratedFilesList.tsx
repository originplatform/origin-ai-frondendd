import React from 'react';
import { Download, FileBarChart2, FileText, Image as ImageIcon } from 'lucide-react';
import type { GeneratedFile } from '../../types/api';
import { api } from '../../lib/api';
import { formatBytes } from '../../lib/utils';
import { Card } from '../ui/Card';

export const GeneratedFilesList: React.FC<{ files: GeneratedFile[] }> = ({ files }) => {
  if (files.length === 0) return null;

  const imageFiles = files.filter((f) => f.content_type.startsWith('image/'));

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-origin-ink">Generated Files & Artifacts</h3>
        <span className="text-xs text-origin-faint">{files.length} files</span>
      </div>

      {imageFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {imageFiles.map((img) => (
            <div
              key={img.id}
              className="rounded-lg border border-origin-border overflow-hidden bg-origin-subtle"
            >
              <img
                src={api.files.downloadUrl(img.id)}
                alt={img.filename}
                className="w-full h-52 object-contain bg-white"
              />
              <div className="px-3 py-2 border-t border-origin-border flex items-center justify-between text-xs">
                <span className="font-medium text-origin-ink truncate">{img.filename}</span>
                <a
                  href={api.files.downloadUrl(img.id)}
                  download={img.filename}
                  className="text-origin-accent hover:underline inline-flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Save
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="divide-y divide-origin-border border border-origin-border rounded-lg">
        {files.map((file) => {
          const Icon = file.content_type.startsWith('image/')
            ? ImageIcon
            : file.file_kind === 'chart'
            ? FileBarChart2
            : FileText;

          return (
            <div
              key={file.id}
              className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-white hover:bg-origin-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 text-origin-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-origin-ink truncate">{file.filename}</div>
                  <div className="text-[11px] text-origin-faint">
                    {file.content_type} · {formatBytes(file.size_bytes)}
                  </div>
                </div>
              </div>
              <a
                href={api.files.downloadUrl(file.id)}
                download={file.filename}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-origin-ink bg-origin-subtle hover:bg-origin-surface border border-origin-border flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
