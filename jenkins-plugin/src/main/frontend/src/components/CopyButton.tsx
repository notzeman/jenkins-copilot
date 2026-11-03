import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

async function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  if (!copied) {
    throw new Error('Clipboard is not available');
  }
}

/** Copies the raw assistant text, including Markdown. */
export function CopyButton({ text, label = 'Copy response' }: { text: string; label?: string }): React.ReactElement {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    },
    [],
  );

  const copy = async (): Promise<void> => {
    try {
      await writeClipboard(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => setState('idle'), 1400);
  };

  return (
    <button
      type="button"
      className={`cp-copy-btn ${state === 'copied' ? 'cp-copy-btn-done' : ''}`}
      title={state === 'copied' ? 'Copied' : state === 'failed' ? 'Could not copy' : label}
      aria-label={state === 'copied' ? 'Copied' : label}
      onClick={() => void copy()}
      disabled={!text.trim()}
    >
      {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
      <span>{state === 'copied' ? 'Copied' : state === 'failed' ? 'Failed' : 'Copy'}</span>
    </button>
  );
}
