import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function portalNode(): HTMLElement | null {
  const host = document.getElementById('jenkins-ai-copilot-root');
  const shadow = host?.shadowRoot;
  if (!shadow) {
    return null;
  }
  let portal = shadow.getElementById('cp-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'cp-portal';
    portal.className = 'cp-portal-root';
    shadow.appendChild(portal);
  }
  return portal;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}): React.ReactElement | null {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }
  const portal = portalNode();
  if (!portal) {
    return null;
  }
  return createPortal(
    <div
      className="cp-confirm-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="cp-confirm" role="dialog" aria-modal="true" aria-labelledby="cp-confirm-title">
        <h3 id="cp-confirm-title">{title}</h3>
        <p>{message}</p>
        <div className="cp-confirm-actions">
          <button type="button" className="cp-btn" onClick={onCancel}>
            Cancel
          </button>
          <button ref={confirmRef} type="button" className="cp-btn cp-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    portal,
  );
}
