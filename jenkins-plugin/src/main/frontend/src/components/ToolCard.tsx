import { useState } from 'react';
import type { Item } from '../types';

type ToolItem = Extract<Item, { kind: 'tool' }>;

export function ToolCard({ item }: { item: ToolItem }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const statusClass =
    item.status === 'succeeded'
      ? 'cp-succeeded'
      : item.status === 'failed' || item.status === 'denied'
        ? 'cp-failed'
        : 'cp-running';
  const target = String(item.args.job ?? item.args.environment ?? item.args.repoUrl ?? item.args.node ?? '');
  return (
    <div
      className={`cp-tool ${item.status === 'succeeded' ? 'cp-done' : ''} ${
        item.status === 'failed' || item.status === 'denied' ? 'cp-failed' : ''
      }`}
    >
      <div
        className="cp-tool-head"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {item.status === 'running' && <span className="cp-spin" aria-hidden="true" />}
        <span className="cp-tool-name">{item.toolName}</span>
        {target && <span className="cp-tool-target">{target}</span>}
        <span className={`cp-status ${statusClass}`}>{item.status}</span>
      </div>
      {open && (
        <div className="cp-tool-body">
          <div>
            <div className="cp-label">Arguments</div>
            <pre className="cp-pre">{JSON.stringify(item.args, null, 2)}</pre>
          </div>
          {item.error && (
            <div>
              <div className="cp-label">Error</div>
              <pre className="cp-pre">{item.error}</pre>
            </div>
          )}
          {item.output !== undefined && item.output !== null && (
            <div>
              <div className="cp-label">Result</div>
              <pre className="cp-pre">{pretty(item.output)}</pre>
            </div>
          )}
          {item.risk !== undefined && (
            <div className="cp-label">
              risk level {item.risk}
              {item.reason ? ` · ${item.reason}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function pretty(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > 8000 ? `${text.slice(0, 8000)}\n…[truncated]` : text;
}
