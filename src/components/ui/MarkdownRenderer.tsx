import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={keyIdx++} className="font-semibold text-origin-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={keyIdx++}
          className="font-mono text-xs bg-origin-surface text-origin-ink px-1.5 py-0.5 rounded"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/.exec(token);
      if (linkMatch) {
        tokens.push(
          <a
            key={keyIdx++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-origin-accent hover:underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        tokens.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }
  return tokens;
}

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={blockKey++} className="font-mono text-xs bg-slate-900 text-slate-100 p-3.5 rounded-lg overflow-x-auto my-2.5">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      i++;
      continue;
    }

    if (line.startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const headerCells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(
          lines[i]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );
        i++;
      }
      elements.push(
        <div key={blockKey++} className="overflow-x-auto my-3 border border-origin-border rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-origin-subtle border-b border-origin-border">
                {headerCells.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 font-medium text-origin-ink">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-origin-border last:border-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-origin-muted">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={blockKey++} className="text-sm font-semibold text-origin-ink mt-3.5 mb-1.5">
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={blockKey++} className="text-base font-semibold text-origin-ink mt-4 mb-2">
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={blockKey++} className="text-lg font-semibold text-origin-ink mt-4 mb-2">
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={blockKey++} className="list-disc pl-5 text-sm text-origin-muted space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={blockKey++} className="list-decimal pl-5 text-sm text-origin-muted space-y-1 my-2">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim().startsWith('> ')) {
      elements.push(
        <blockquote
          key={blockKey++}
          className="border-l-2 border-origin-accent pl-3 text-sm text-origin-muted italic my-2.5"
        >
          {renderInline(line.trim().slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    elements.push(
      <p key={blockKey++} className="text-sm text-origin-muted leading-relaxed my-1.5">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="markdown-prose">{elements}</div>;
};
