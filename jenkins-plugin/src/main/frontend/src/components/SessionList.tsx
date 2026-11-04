import { useMemo, useState } from 'react';
import type { SessionSummary } from '../types';
import {
  ChevronIcon,
  FolderIcon,
  GearIcon,
  PencilIcon,
  PlusIcon,
  StatusIcon,
  TrashIcon,
  XIcon,
  type StatusState,
} from './icons';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  sessions: SessionSummary[];
  activeId?: string;
  currentPipeline?: string;
  collapsed: Set<string>;
  onToggle: (pipeline: string) => void;
  onSelect: (id: string) => void;
  onNew: (pipeline?: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose?: () => void;
  onSettings?: () => void;
  onCloseSidebar?: () => void;
}

const SESSION_STATUS: Record<string, { state: StatusState; label: string }> = {
  awaiting_approval: { state: 'unstable', label: 'Waiting for your approval' },
  error: { state: 'failure', label: 'Stopped with an error' },
  running: { state: 'running', label: 'Running' },
};

/** Idle sessions show nothing: only states that need attention earn an icon. */
function SessionStatus({ status }: { status: string }): React.ReactElement {
  const info = SESSION_STATUS[status];
  return (
    <span className="cp-session-status">
      {info && <StatusIcon state={info.state} label={info.label} />}
    </span>
  );
}

function relativeTime(value: number): string {
  const delta = Date.now() - value;
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function shortPipeline(pipeline: string): string {
  if (pipeline === 'General') return 'General';
  const parts = pipeline.split('/').filter(Boolean);
  return parts.length > 1 ? `${parts[parts.length - 2]}/${parts[parts.length - 1]}` : pipeline;
}

export function SessionList({
  sessions,
  activeId,
  currentPipeline,
  collapsed,
  onToggle,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
  onSettings,
  onCloseSidebar,
}: Props): React.ReactElement {
  const [query, setQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<SessionSummary | null>(null);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = sessions.filter((session) => {
      if (!needle) return true;
      return (
        session.title.toLowerCase().includes(needle) ||
        session.pipeline.toLowerCase().includes(needle) ||
        session.model.toLowerCase().includes(needle)
      );
    });
    const map = new Map<string, SessionSummary[]>();
    for (const session of filtered) {
      const pipeline = session.pipeline || 'General';
      const list = map.get(pipeline) ?? [];
      list.push(session);
      map.set(pipeline, list);
    }
    return [...map.entries()]
      .map(([pipeline, items]) => ({ pipeline, items: items.sort((a, b) => b.updatedAt - a.updatedAt) }))
      .sort((a, b) => (b.items[0]?.updatedAt ?? 0) - (a.items[0]?.updatedAt ?? 0));
  }, [sessions, query]);

  const beginRename = (session: SessionSummary): void => {
    setRenamingId(session.id);
    setRenameValue(session.title === 'New conversation' ? '' : session.title);
  };

  return (
    <div className="cp-sessions">
      <div className="cp-sessions-head">
        <div className="cp-sessions-title-row">
          {onCloseSidebar && (
            <button
              type="button"
              className="cp-bar-btn"
              onClick={onCloseSidebar}
              data-tip="Close sidebar"
              aria-label="Close sidebar"
            >
              <XIcon />
            </button>
          )}
          <span className="cp-sessions-title">Pipelines</span>
          <span className="cp-sessions-count">{sessions.length}</span>
          <span className="cp-grow" />
          {onClose && (
            <button type="button" className="cp-bar-btn" onClick={onClose} data-tip="Back to chat" aria-label="Back to chat">
              <ChevronIcon className="cp-back-chevron" />
            </button>
          )}
          {onSettings && (
            <button
              type="button"
              className="cp-bar-btn"
              onClick={onSettings}
              data-tip="Settings"
              aria-label="Settings"
            >
              <GearIcon />
            </button>
          )}
          <button
            type="button"
            className="cp-bar-btn"
            onClick={() => onNew(currentPipeline)}
            data-tip="New session"
            aria-label="New session"
          >
            <PlusIcon />
          </button>
        </div>
        <input
          className="cp-session-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search sessions or pipelines"
          aria-label="Search sessions"
        />
      </div>

      <div className="cp-sessions-scroll">
        {groups.length === 0 && (
          <div className="cp-session-empty">
            {query ? 'No sessions match your search.' : 'No sessions yet. Start one for a pipeline.'}
          </div>
        )}
        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.pipeline);
          return (
            <section className="cp-session-group" key={group.pipeline}>
              <div className="cp-session-group-head">
                <button
                  type="button"
                  className="cp-session-group-toggle"
                  onClick={() => onToggle(group.pipeline)}
                  aria-expanded={!isCollapsed}
                  data-tip={group.pipeline}
                  data-tip-truncated
                >
                  <ChevronIcon className={`cp-session-chevron ${isCollapsed ? 'cp-collapsed' : ''}`} />
                  <FolderIcon className="cp-session-folder" />
                  <span className="cp-session-pipeline" data-truncates>{shortPipeline(group.pipeline)}</span>
                  <span className="cp-session-group-count">{group.items.length}</span>
                </button>
                <button
                  type="button"
                  className="cp-session-new"
                  onClick={() => onNew(group.pipeline)}
                  data-tip={`New session in ${group.pipeline}`}
                  aria-label={`New session in ${group.pipeline}`}
                >
                  <PlusIcon />
                </button>
              </div>

              {!isCollapsed && (
                <div className="cp-session-rows">
                  {group.items.map((session) => {
                    const active = session.id === activeId;
                    const title =
                      session.title === 'New conversation' || !session.title
                        ? 'New session'
                        : session.title;
                    return (
                      <div className={`cp-session-row ${active ? 'cp-session-row-active' : ''}`} key={session.id}>
                        {renamingId === session.id ? (
                          <div className="cp-session-row-main">
                            <SessionStatus status={session.status} />
                            <input
                              className="cp-session-rename"
                              value={renameValue}
                              autoFocus
                              placeholder="Session name"
                              onChange={(event) => setRenameValue(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  const value = renameValue.trim();
                                  if (value) onRename(session.id, value);
                                  setRenamingId(null);
                                } else if (event.key === 'Escape') {
                                  setRenamingId(null);
                                }
                              }}
                              onBlur={() => setRenamingId(null)}
                            />
                          </div>
                        ) : (
                          <div className="cp-session-row-main">
                            <SessionStatus status={session.status} />
                            <button
                              type="button"
                              className="cp-session-open"
                              onClick={() => onSelect(session.id)}
                              data-tip={session.title}
                              data-tip-truncated
                            >
                            <span className="cp-session-row-text">
                              <span className="cp-session-name" data-truncates>{title}</span>
                              <span className="cp-session-meta">
                                {relativeTime(session.updatedAt)}
                                {session.model ? ` · ${session.model}` : ''}
                              </span>
                            </span>
                            </button>
                          </div>
                        )}
                        {renamingId !== session.id && (
                          <span className="cp-session-actions">
                            <button
                              type="button"
                              className="cp-session-action"
                              data-tip="Rename session"
                              aria-label="Rename session"
                              onClick={() => beginRename(session)}
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              className="cp-session-action"
                              data-tip="Delete session"
                              aria-label="Delete session"
                              onClick={() => setDeleteTarget(session)}
                            >
                              <TrashIcon />
                            </button>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete session?"
        message={
          deleteTarget
            ? `"${
                deleteTarget.title === 'New conversation' || !deleteTarget.title
                  ? 'New session'
                  : deleteTarget.title
              }" will be permanently deleted, including its messages and attachments.`
            : ''
        }
        confirmLabel="Delete session"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) {
            onDelete(target.id);
          }
        }}
      />
    </div>
  );
}
