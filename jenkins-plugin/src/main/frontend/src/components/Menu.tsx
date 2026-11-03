import { createPortal } from 'react-dom';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface MenuProps {
  open: boolean;
  anchor: HTMLElement | null;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  maxHeight?: number;
  align?: 'start' | 'end';
}

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

/** Fixed-position menu rendered inside the drawer's shadow root, so it is never clipped by Jenkins or the drawer. */
export function Menu({
  open,
  anchor,
  onClose,
  children,
  width = 300,
  maxHeight = 380,
  align = 'end',
}: MenuProps): React.ReactElement | null {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number; width: number }>({
    left: -9999,
    top: -9999,
    width,
  });

  const place = useCallback(() => {
    const menu = ref.current;
    if (!anchor || !menu) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const actualWidth = Math.min(Math.max(width, 220), window.innerWidth - 16);
    let left = align === 'end' ? rect.right - actualWidth : rect.left;
    left = Math.min(Math.max(left, 8), window.innerWidth - actualWidth - 8);

    // Measure the rendered menu so short menus sit next to the trigger instead of
    // reserving the full max height.
    const menuHeight = Math.min(menu.offsetHeight, maxHeight);
    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuHeight - 6);
    }
    setPosition((current) =>
      current.left === left && current.top === top && current.width === actualWidth
        ? current
        : { left, top, width: actualWidth },
    );
  }, [align, anchor, maxHeight, width]);

  useLayoutEffect(() => {
    if (open) {
      place();
    }
  }, [open, place]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const menu = ref.current;
    if (!menu || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(() => place());
    observer.observe(menu);
    return () => observer.disconnect();
  }, [open, place]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent): void => {
      const path = event.composedPath?.() ?? [];
      if (path.includes(ref.current as EventTarget) || path.includes(anchor as EventTarget)) {
        return;
      }
      onClose();
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    const onScroll = (event: Event): void => {
      const path = event.composedPath?.() ?? [];
      if (path.includes(ref.current as EventTarget)) {
        return;
      }
      onClose();
    };
    const onResize = (): void => onClose();
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, anchor, onClose]);

  if (!open) {
    return null;
  }
  const portal = portalNode();
  if (!portal) {
    return null;
  }
  return createPortal(
    <div
      ref={ref}
      className="cp-menu"
      style={{
        position: 'fixed',
        left: position.left,
        top: position.top,
        width: position.width,
        maxHeight,
        zIndex: 2147483002,
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    portal,
  );
}
