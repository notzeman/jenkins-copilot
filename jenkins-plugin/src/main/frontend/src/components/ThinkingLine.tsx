import { useEffect, useState } from 'react';
import { BowTie } from './icons';
import { toolMeta } from './toolMeta';

const VERBS = [
  'Pondering',
  'Straightening the bow tie',
  'Minding the queue',
  'Deliberating',
  'Polishing the silver',
  'Ruminating',
];

/**
 * Live "working" line at the end of the thread. While a tool runs it says what is really
 * happening; between tools it shows a clearly playful verb instead of claiming an action.
 */
export function ThinkingLine({ toolName }: { toolName?: string }): React.ReactElement {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const label = toolName ? toolMeta(toolName).activity : VERBS[Math.floor(seconds / 4) % VERBS.length];

  return (
    <div className="cp-working" role="status" aria-label="Copilot is working">
      <BowTie className="cp-tie-busy" />
      <span className="cp-shimmer" key={label} aria-hidden="true">
        {label}…
      </span>
      {seconds >= 3 && (
        <span className="cp-working-time" aria-hidden="true">
          {seconds}s
        </span>
      )}
    </div>
  );
}
