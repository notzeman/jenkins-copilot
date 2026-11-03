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

export function BotIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v2M9 3h6" strokeLinecap="round" />
      <rect x="4.5" y="7" width="15" height="12" rx="3.5" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <path d="M9.5 15.5c.7.7 1.5 1 2.5 1s1.8-.3 2.5-1" strokeLinecap="round" />
      <path d="M4.5 11H2.5M21.5 11h-2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function GearIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={1.7} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.36.7.6 1 .3.3.7.4 1.1.4H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.6Z" />
    </svg>
  );
}

export function ExpandIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M4 12 20 4l-5 16-4-6-7-2Z" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" strokeLinejoin="round" />
      <path d="M12 9.5v4M12 16.6h.01" strokeLinecap="round" />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function FolderIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5v-10Z" strokeLinejoin="round" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" strokeLinejoin="round" />
      <path d="m14 7 3 3" strokeLinecap="round" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps): React.ReactElement {
  return (
    <svg {...base} className={className}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" strokeLinecap="round" />
    </svg>
  );
}

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
