import type { Item } from '../types';
import { FlagIcon } from './icons';

type ApprovalItem = Extract<Item, { kind: 'approval' }>;

/** Always-visible quick actions for the first pending approval. */
export function ApprovalDock({
  approvals,
  onDecide,
}: {
  approvals: ApprovalItem[];
  onDecide: (approval: ApprovalItem, approved: boolean, comment: string) => void;
}): React.ReactElement | null {
  const first = approvals[0];
  if (!first) {
    return null;
  }
  return (
    <div className={`cp-approval-dock ${first.risk >= 3 ? 'cp-approval-dock-risk3' : ''}`}>
      <div className="cp-approval-dock-main">
        <FlagIcon />
        <div className="cp-approval-dock-text">
          <div className="cp-approval-dock-title">
            {approvals.length > 1 ? `${approvals.length} approvals pending` : 'Approval required'}
          </div>
          <div className="cp-approval-dock-meta">
            {first.toolName}
            {first.target ? ` · ${first.target}` : ''}
          </div>
        </div>
      </div>
      <div className="cp-approval-dock-actions">
        <button
          type="button"
          className="cp-btn cp-primary cp-btn-sm"
          onClick={() => onDecide(first, true, '')}
        >
          Approve
        </button>
        <button
          type="button"
          className="cp-btn cp-danger cp-btn-sm"
          onClick={() => onDecide(first, false, '')}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
