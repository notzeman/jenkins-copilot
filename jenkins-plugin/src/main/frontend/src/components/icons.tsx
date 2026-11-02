interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  'aria-hidden': true,
} as const;

export function TrashIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function RefreshIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M20 6v5h-5M4 18v-5h5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.4 9A7 7 0 0 0 6 6.3L4 11M5.6 15A7 7 0 0 0 18 17.7l2-4.7" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 5 6v5.5c0 4.2 2.8 7.9 7 9.5 4.2-1.6 7-5.3 7-9.5V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProviderIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

export function ModelIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" strokeLinejoin="round" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  );
}

export function ThinkingIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8V16a3 3 0 0 0 3 3h1v1h4v-1h1a3 3 0 0 0 3-3v-2.2A3 3 0 0 0 18 8V7a3 3 0 0 0-3-3h-1V3H9v1Z" strokeLinejoin="round" />
      <path d="M9 10h.01M15 10h.01M9 14c.8.8 1.8 1.2 3 1.2s2.2-.4 3-1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="m7 10 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}

export function FlagIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M5 21V4M5 4h11l-2 3 2 3H5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={2.2} className={className}>
      <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PaperclipIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="m20 11-8.5 8.5a4 4 0 0 1-5.66-5.66L14.5 5a2.83 2.83 0 0 1 4 4l-8.5 8.5a1.66 1.66 0 0 1-2.34-2.34L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
