import { useEffect, useRef, useState } from 'react';
import type { Item } from '../types';
import { DiffView } from './DiffView';
import { ChevronIcon, ShieldWarningIcon, StatusIcon } from './icons';

type ApprovalItem = Extract<Item, { kind: 'approval' }>;

interface Props {
  item: ApprovalItem;
  onDecide: (approval: ApprovalItem, approved: boolean, comment: string) => void;
}

export function ApprovalCard({ item, onDecide }: Props): React.ReactElement {
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const decided = item.status !== 'pending';

  useEffect(() => {
    if (decided) {
      return;
    }
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const scroll = (): void => {
      const thread = card.closest('.cp-thread') as HTMLElement | null;
      if (!thread) {
        return;
      }
      const cardRect = card.getBoundingClientRect();
      const threadRect = thread.getBoundingClientRect();
      thread.scrollTop = Math.max(0, thread.scrollTop + cardRect.top - threadRect.top - 8);
    };
    scroll();
    const frame = window.requestAnimationFrame(scroll);
    return () => window.cancelAnimationFrame(frame);
  }, [decided, item.approvalId]);
  const riskClass = item.risk >= 3 ? 'cp-risk3' : '';
  const validation = item.validation as
    | { validated?: boolean; kind?: string; errors?: string[] }
    | null
    | undefined;
  const target = item.target ?? String(item.args.job ?? item.args.environment ?? '');
  return (
    <div className={`cp-approval ${riskClass} ${decided ? `cp-approval-${item.status}` : ''}`} ref={cardRef}>
      <div className="cp-approval-head">
        <span className="cp-approval-title">
          {decided ? `Change ${item.status}` : 'Approval required'}
        </span>
        <span
          className={`cp-risk ${item.risk >= 3 ? 'cp-r3' : 'cp-r2'}`}
          role="img"
          tabIndex={0}
          aria-label={item.risk >= 3 ? 'Privileged action' : 'Controlled action'}
          data-tip={item.risk >= 3 ? 'Privileged action (level 3)' : 'Controlled action (level 2)'}
        >
          <ShieldWarningIcon />
          <span className="cp-sr">{item.risk >= 3 ? 'privileged' : 'controlled'}</span>
        </span>
      </div>
      <div className="cp-approval-body">
        <dl className="cp-kv">
          <dt>Action</dt>
          <dd>{item.toolName}</dd>
          {target && (
            <>
              <dt>Target</dt>
              <dd>{target}</dd>
            </>
          )}
          <dt>Why</dt>
          <dd style={{ fontFamily: 'var(--cp-sans)' }}>{item.reason}</dd>
          <dt>Expires</dt>
          <dd>{new Date(item.expiresAt).toLocaleString()}</dd>
        </dl>

        {validation && (
          <div className={`cp-validation ${validation.validated ? 'cp-ok' : 'cp-bad'}`}>
            <StatusIcon
              state={validation.validated ? 'success' : 'failure'}
              label={validation.validated ? 'Validation passed' : 'Validation failed'}
            />
            <span>
              {validation.validated
                ? `Jenkinsfile validated (${validation.kind ?? 'declarative'})`
                : `Validation failed: ${(validation.errors ?? []).slice(0, 2).join('; ')}`}
            </span>
          </div>
        )}

        {item.diff && (
          <>
            <button
              type="button"
              className={`cp-disclose ${expanded ? 'cp-disclose-open' : ''}`}
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              <ChevronIcon />
              {expanded ? 'Hide diff' : 'Review diff'}
            </button>
            <div className={`cp-fold ${expanded ? 'cp-fold-open' : ''}`}>
              <div className="cp-fold-inner">{expanded && <DiffView diff={item.diff} />}</div>
            </div>
          </>
        )}

        {!expanded && (
          <details>
            <summary className="cp-label" style={{ cursor: 'pointer' }}>
              Arguments
            </summary>
            <pre className="cp-pre">{JSON.stringify(item.args, null, 2)}</pre>
          </details>
        )}

        {!decided && (
          <>
            <input
              className="cp-input"
              placeholder="Optional comment for the audit trail"
              value={comment}
              maxLength={2000}
              onChange={(event) => setComment(event.target.value)}
            />
            <div className="cp-actions">
              <button
                type="button"
                className="cp-btn cp-primary"
                onClick={() => onDecide(item, true, comment)}
              >
                Approve and run
              </button>
              <button
                type="button"
                className="cp-btn cp-danger"
                onClick={() => onDecide(item, false, comment)}
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
