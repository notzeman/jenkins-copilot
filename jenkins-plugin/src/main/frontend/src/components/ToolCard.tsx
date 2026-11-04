import { useState } from 'react';
import type { Item } from '../types';
import { ChevronIcon, JenkinsSymbol, StatusIcon, type StatusState } from './icons';
import { toolMeta } from './toolMeta';

type ToolItem = Extract<Item, { kind: 'tool' }>;

const STATUS: Record<ToolItem['status'], { state: StatusState; label: string }> = {
  running: { state: 'running', label: 'Running' },
  succeeded: { state: 'success', label: 'Succeeded' },
  failed: { state: 'failure', label: 'Failed' },
  denied: { state: 'aborted', label: 'Denied' },
};

export function ToolCard({ item }: { item: ToolItem }): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const status = STATUS[item.status];
  const target = String(item.args.job ?? item.args.environment ?? item.args.repoUrl ?? item.args.node ?? '');
  const toggle = (): void => {
    setOpened(true);
    setOpen((value) => !value);
  };
  return (
    <div className={`cp-tool cp-tool-${item.status} ${open ? 'cp-tool-open' : ''}`}>
      <div className="cp-tool-head">
        <StatusIcon state={status.state} label={status.label} className="cp-tool-status" />
        <button type="button" className="cp-tool-toggle" aria-expanded={open} onClick={toggle}>
          <JenkinsSymbol name={toolMeta(item.toolName).icon} className="cp-tool-icon" />
          <span className="cp-tool-name">{item.toolName}</span>
          {target && <span className="cp-tool-target">{target}</span>}
          <ChevronIcon className="cp-tool-chevron" />
        </button>
      </div>
      <div className={`cp-fold ${open ? 'cp-fold-open' : ''}`}>
        <div className="cp-fold-inner">
          {opened && (
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
                  Risk level {item.risk}
                  {item.reason ? ` · ${item.reason}` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function pretty(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > 8000 ? `${text.slice(0, 8000)}\n…[truncated]` : text;
}
