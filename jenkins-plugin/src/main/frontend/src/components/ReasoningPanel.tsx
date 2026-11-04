import { useEffect, useRef, useState } from 'react';
import type { Item } from '../types';
import { BowTie, ChevronIcon } from './icons';

type ReasoningItem = Extract<Item, { kind: 'reasoning' }>;

/** Provider reasoning: streams live with a shimmer, then folds into "Thought for Ns". */
export function ReasoningPanel({ item }: { item: ReasoningItem }): React.ReactElement {
  const [open, setOpen] = useState(!item.done);
  const startedAt = useRef(Date.now());
  const [duration, setDuration] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item.done) {
      setOpen(false);
      setDuration(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
    }
  }, [item.done]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body && !item.done) {
      body.scrollTop = body.scrollHeight;
      body.classList.toggle('cp-reasoning-clipped', body.scrollHeight > body.clientHeight);
    }
  }, [item.text, item.done]);

  return (
    <div className={`cp-reasoning ${open ? 'cp-reasoning-open' : ''} ${item.done ? '' : 'cp-reasoning-live'}`}>
      <button
        type="button"
        className="cp-reasoning-head"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <BowTie className={item.done ? 'cp-tie-still' : 'cp-tie-busy'} />
        {item.done ? (
          <span className="cp-reasoning-title">{duration ? `Thought for ${duration}s` : 'Thought process'}</span>
        ) : (
          <span className="cp-shimmer cp-reasoning-title">Thinking…</span>
        )}
        <ChevronIcon className="cp-reasoning-chevron" />
      </button>
      <div className={`cp-fold ${open ? 'cp-fold-open' : ''}`}>
        <div className="cp-fold-inner">
          <div className="cp-reasoning-body" ref={bodyRef}>
            {item.text}
          </div>
        </div>
      </div>
    </div>
  );
}
