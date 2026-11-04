import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Tip {
  text: string;
  anchor: DOMRect;
}

const HOVER_DELAY = 280;
const EDGE = 8;

/** With data-tip-truncated, a tooltip only appears when the text is actually cut off. */
function isTruncated(element: HTMLElement): boolean {
  const text = (element.querySelector('[data-truncates]') as HTMLElement | null) ?? element;
  return text.scrollWidth > text.clientWidth;
}

function tipTarget(event: Event): HTMLElement | null {
  const target = event.target;
  return target instanceof Element ? (target.closest('[data-tip]') as HTMLElement | null) : null;
}

/**
 * One tooltip for the whole UI. Elements opt in with data-tip and also carry an aria-label.
 * Jenkins' tooltips can't reach into the shadow root, and native title is slow and unstyled.
 */
export function TipLayer(): React.ReactElement | null {
  const [tip, setTip] = useState<Tip | null>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number; below: boolean } | null>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = hostRef.current?.getRootNode();
    if (!root) {
      return;
    }
    let timer: number | undefined;
    let current: HTMLElement | null = null;
    let lastHidden = 0;
    let watcher: number | undefined;

    const hide = (): void => {
      window.clearTimeout(timer);
      window.clearInterval(watcher);
      if (current) {
        lastHidden = Date.now();
      }
      current = null;
      setTip(null);
      setPlacement(null);
    };
    const show = (element: HTMLElement, delay: number): void => {
      const text = element.dataset.tip;
      if (!text || (element.hasAttribute('data-tip-truncated') && !isTruncated(element))) {
        hide();
        return;
      }
      window.clearTimeout(timer);
      current = element;
      timer = window.setTimeout(() => {
        if (current === element && element.isConnected) {
          setPlacement(null);
          setTip({ text, anchor: element.getBoundingClientRect() });
          // A control can change while its tooltip shows: React reuses one button for Send and Stop.
          window.clearInterval(watcher);
          watcher = window.setInterval(() => {
            if (!element.isConnected || element.dataset.tip !== text) {
              hide();
            }
          }, 200);
        }
      }, delay);
    };

    const onOver = (event: Event): void => {
      if ((event as PointerEvent).pointerType === 'touch') {
        return;
      }
      const element = tipTarget(event);
      if (element === current) {
        return;
      }
      if (!element) {
        hide();
        return;
      }
      // Moving along a row of icons shows the next tooltip immediately.
      show(element, Date.now() - lastHidden < 400 || current ? 0 : HOVER_DELAY);
    };
    const onFocus = (event: Event): void => {
      const element = tipTarget(event);
      // Buttons clicked with a mouse don't get :focus-visible; tapped status icons still show.
      if (element && (element.matches(':focus-visible') || element.tagName !== 'BUTTON')) {
        show(element, 0);
      }
    };
    const onKey = (event: Event): void => {
      if ((event as KeyboardEvent).key === 'Escape') {
        hide();
      }
    };

    root.addEventListener('pointerover', onOver);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', hide);
    root.addEventListener('pointerdown', hide);
    root.addEventListener('keydown', onKey);
    root.addEventListener('wheel', hide, { passive: true });
    window.addEventListener('blur', hide);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(watcher);
      root.removeEventListener('pointerover', onOver);
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', hide);
      root.removeEventListener('pointerdown', hide);
      root.removeEventListener('keydown', onKey);
      root.removeEventListener('wheel', hide);
      window.removeEventListener('blur', hide);
    };
  }, []);

  useLayoutEffect(() => {
    const element = tipRef.current;
    if (!tip || !element) {
      return;
    }
    const { width, height } = element.getBoundingClientRect();
    const below = tip.anchor.top - height - EDGE < EDGE;
    const center = tip.anchor.left + tip.anchor.width / 2;
    setPlacement({
      left: Math.max(EDGE, Math.min(center - width / 2, window.innerWidth - width - EDGE)),
      top: below ? tip.anchor.bottom + 6 : tip.anchor.top - height - 6,
      below,
    });
  }, [tip]);

  return (
    <>
      <span ref={hostRef} hidden />
      {tip && (
        <div
          ref={tipRef}
          className={`cp-tip ${placement ? 'cp-tip-show' : ''} ${placement?.below ? 'cp-tip-below' : ''}`}
          role="tooltip"
          style={placement ? { left: placement.left, top: placement.top } : { left: 0, top: 0, visibility: 'hidden' }}
        >
          {tip.text}
        </div>
      )}
    </>
  );
}
