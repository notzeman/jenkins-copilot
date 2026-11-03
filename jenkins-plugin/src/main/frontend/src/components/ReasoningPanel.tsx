import { useEffect, useState } from 'react';
import type { Item } from '../types';
import { ChevronIcon } from './icons';

type ReasoningItem = Extract<Item, { kind: 'reasoning' }>;

/** Muted, collapsible analysis panel. Collapses automatically once the answer starts. */
export function ReasoningPanel({ item }: { item: ReasoningItem }): React.ReactElement {
  const [open, setOpen] = useState(!item.done);

  useEffect(() => {
    if (item.done) {
      setOpen(false);
    }
  }, [item.done]);

  return (
    <div className={`cp-reasoning ${open ? 'cp-reasoning-open' : ''}`}>
      <button
        type="button"
        className="cp-reasoning-head"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        title={open ? 'Hide analysis' : 'Show analysis'}
      >
        <span className={`cp-reasoning-dot ${item.done ? 'cp-reasoning-dot-done' : ''}`} />
        <span className="cp-reasoning-title">{item.done ? 'Analysis' : 'Thinking…'}</span>
        <span className="cp-grow" />
        <ChevronIcon className={`cp-reasoning-chevron ${open ? 'cp-reasoning-chevron-open' : ''}`} />
      </button>
      {open && <div className="cp-reasoning-body">{item.text}</div>}
    </div>
  );
}
