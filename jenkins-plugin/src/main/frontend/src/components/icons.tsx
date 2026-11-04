import { symbols, type SymbolName } from './jenkinsSymbols';

interface IconProps {
  className?: string;
}

export function JenkinsSymbol({ name, className }: IconProps & { name: SymbolName }): React.ReactElement {
  const symbol = symbols[name];
  return (
    <svg
      viewBox={symbol.viewBox}
      className={className}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: symbol.body }}
    />
  );
}

function symbolIcon(name: SymbolName) {
  return function SymbolIcon({ className }: IconProps): React.ReactElement {
    return <JenkinsSymbol name={name} className={className} />;
  };
}

export const PlusIcon = symbolIcon('add');
export const GearIcon = symbolIcon('settings');
export const ExpandIcon = symbolIcon('expand-outline');
export const ContractIcon = symbolIcon('contract-outline');
export const SendIcon = symbolIcon('send');
export const AlertIcon = symbolIcon('warning-outline');
export const GitHubIcon = symbolIcon('logo-github');
export const FolderIcon = symbolIcon('folder');
export const PencilIcon = symbolIcon('edit');
export const TrashIcon = symbolIcon('trash');
export const SunIcon = symbolIcon('sunny-outline');
export const MoonIcon = symbolIcon('moon-outline');
export const RefreshIcon = symbolIcon('refresh');
export const XIcon = symbolIcon('close');
export const ShieldIcon = symbolIcon('shield-checkmark-outline');
export const ShieldWarningIcon = symbolIcon('shield-warning');
export const ProviderIcon = symbolIcon('cloud-outline');
export const ModelIcon = symbolIcon('cube-outline');
export const ThinkingIcon = symbolIcon('bulb-outline');
export const ChevronIcon = symbolIcon('chevron-down');
export const StopIcon = symbolIcon('stop');
export const FlagIcon = symbolIcon('flag-outline');
export const CopyIcon = symbolIcon('copy-outline');
export const CheckIcon = symbolIcon('check');
export const PaperclipIcon = symbolIcon('attach-outline');
export const PaletteIcon = symbolIcon('color-palette-outline');
export const RibbonIcon = symbolIcon('ribbon-outline');
export const DefaultIcon = symbolIcon('checkmark-circle');
export const InfoIcon = symbolIcon('document-text');
export const ChatIcon = symbolIcon('chatbubble-outline');

/**
 * The Copilot mark: a C of pipeline track with one stage held in the opening, waiting for approval.
 * The ring turns while Copilot works.
 */
export function CopilotMark({ className }: IconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 256 256" className={`cp-mark ${className ?? ''}`} fill="currentColor" aria-hidden="true" focusable="false">
      <path className="cp-mark-ring" d="M193.59 50.71A104 104 0 1 0 193.59 205.29A18 18 0 0 0 169.50 178.53A68 68 0 1 1 169.50 77.47A18 18 0 0 0 193.59 50.71Z" />
      <circle className="cp-mark-stage" cx="210" cy="128" r="27" />
    </svg>
  );
}

export type StatusState = 'success' | 'failure' | 'unstable' | 'aborted' | 'pending' | 'running';

const STATUS_SYMBOLS: Record<StatusState, SymbolName> = {
  success: 'status-blue',
  failure: 'status-red',
  unstable: 'status-yellow',
  aborted: 'status-aborted',
  pending: 'status-nobuilt',
  running: 'status-blue-anime',
};

/** Jenkins' own build status icon. The label is the tooltip and the accessible name. */
export function StatusIcon({
  state,
  label,
  className,
}: IconProps & { state: StatusState; label: string }): React.ReactElement {
  return (
    <span
      className={`cp-statusicon cp-statusicon-${state} ${className ?? ''}`}
      role="img"
      aria-label={label}
      data-tip={label}
      tabIndex={0}
    >
      <JenkinsSymbol name={STATUS_SYMBOLS[state]} />
    </span>
  );
}

/** Maps a Jenkins build result (SUCCESS, FAILURE, …) to a status icon state. */
export function buildState(result: string | null | undefined): StatusState {
  switch (result) {
    case 'SUCCESS':
      return 'success';
    case 'FAILURE':
      return 'failure';
    case 'UNSTABLE':
      return 'unstable';
    case 'ABORTED':
      return 'aborted';
    case 'NOT_BUILT':
      return 'pending';
    default:
      return result ? 'pending' : 'running';
  }
}
