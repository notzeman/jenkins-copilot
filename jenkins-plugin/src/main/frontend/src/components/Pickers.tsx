import { useEffect, useMemo, useRef, useState } from 'react';
import type { ModelInfo, ProviderAccount } from '../types';
import { Menu } from './Menu';
import { CheckIcon, ChevronIcon, ModelIcon, ProviderIcon, RefreshIcon, ThinkingIcon } from './icons';

export type ModelsState = Record<string, ModelInfo[] | 'loading' | { error: string }>;

const THINKING_OPTIONS = [
  { value: 'AUTO', label: 'Auto', description: 'Let the model decide' },
  { value: 'OFF', label: 'Off', description: 'No extended reasoning' },
  { value: 'LOW', label: 'Low', description: 'Fast reasoning' },
  { value: 'MEDIUM', label: 'Medium', description: 'Balanced reasoning' },
  { value: 'HIGH', label: 'High', description: 'Deep reasoning' },
];

interface TriggerProps {
  icon: React.ReactNode;
  value: string;
  title?: string;
  muted?: boolean;
  kind?: 'provider' | 'thinking';
  onClick: (element: HTMLButtonElement) => void;
  active?: boolean;
}

function PillTrigger({ icon, value, title, muted, kind, onClick, active }: TriggerProps): React.ReactElement {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      className={`cp-pill ${kind ? `cp-pill-${kind}` : ''} ${active ? 'cp-pill-active' : ''}`}
      data-tip={title}
      aria-label={title ? `${title}: ${value}` : value}
      onClick={() => ref.current && onClick(ref.current)}
    >
      <span className="cp-pill-icon">{icon}</span>
      <span className={`cp-pill-value ${muted ? 'cp-pill-muted' : ''}`}>{value}</span>
      <ChevronIcon className="cp-pill-chevron" />
    </button>
  );
}

export function ProviderPicker({
  accounts,
  value,
  onSelect,
}: {
  accounts: ProviderAccount[];
  value: string;
  onSelect: (account: ProviderAccount) => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const selected = accounts.find((account) => account.id === value) ?? accounts[0];
  return (
    <>
      <PillTrigger
        icon={<ProviderIcon />}
        value={selected ? selected.label : 'No provider'}
        title="Provider"
        kind="provider"
        muted={!selected}
        active={open}
        onClick={(element) => {
          setAnchor(element);
          setOpen((value) => !value);
        }}
      />
      <Menu open={open} anchor={anchor} onClose={() => setOpen(false)} width={260}>
        <div className="cp-menu-label">Provider accounts</div>
        {accounts.length === 0 && <div className="cp-menu-empty">No providers configured</div>}
        {accounts.map((account) => (
          <button
            type="button"
            key={account.id}
            className={`cp-menu-item ${account.id === selected?.id ? 'cp-menu-item-selected' : ''}`}
            onClick={() => {
              onSelect(account);
              setOpen(false);
            }}
          >
            <ProviderIcon className="cp-menu-item-icon" />
            <span className="cp-menu-item-main">
              <span className="cp-menu-item-title">{account.label}</span>
              <span className="cp-menu-item-meta">
                {account.providerLabel}
                {account.default ? ' · default' : ''}
              </span>
            </span>
            {account.id === selected?.id && <CheckIcon className="cp-menu-check" />}
          </button>
        ))}
      </Menu>
    </>
  );
}

export function ModelPicker({
  accounts,
  accountId,
  model,
  models,
  onOpen,
  onSelect,
  onRefresh,
}: {
  accounts: ProviderAccount[];
  accountId: string;
  model: string;
  models: ModelsState;
  onOpen: (accountId: string) => void;
  onSelect: (accountId: string, model: string) => void;
  onRefresh: () => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const accountsRef = useRef(accounts);
  const modelsRef = useRef(models);
  const onOpenRef = useRef(onOpen);
  accountsRef.current = accounts;
  modelsRef.current = models;
  onOpenRef.current = onOpen;

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery('');
    setActive(0);
    for (const account of accountsRef.current) {
      const state = modelsRef.current[account.id];
      if (!state || state === 'loading' || 'error' in state) {
        onOpenRef.current(account.id);
      }
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const out: Array<{ account: ProviderAccount; model: ModelInfo }> = [];
    for (const account of accounts) {
      const state = models[account.id];
      if (!Array.isArray(state)) {
        continue;
      }
      for (const item of state) {
        if (
          !needle ||
          item.id.toLowerCase().includes(needle) ||
          item.label.toLowerCase().includes(needle) ||
          account.label.toLowerCase().includes(needle)
        ) {
          out.push({ account, model: item });
        }
      }
    }
    return out;
  }, [accounts, models, query]);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const current = accounts.find((account) => account.id === accountId);
  const currentModel =
    filtered.find((entry) => entry.model.id === model && entry.account.id === accountId)?.model.label ??
    model;
  const label = currentModel || 'Select model';

  const choose = (account: ProviderAccount, item: ModelInfo): void => {
    onSelect(account.id, item.id);
    setOpen(false);
  };

  return (
    <>
      <PillTrigger
        icon={<ModelIcon />}
        value={label}
        title={current ? `Model · ${current.label}` : 'Model'}
        muted={!currentModel}
        active={open}
        onClick={(element) => {
          setAnchor(element);
          setOpen((value) => !value);
        }}
      />
      <Menu open={open} anchor={anchor} onClose={() => setOpen(false)} width={340} maxHeight={420}>
        <div className="cp-menu-search">
          <input
            ref={inputRef}
            value={query}
            placeholder="Search models or providers…"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActive((value) => Math.min(value + 1, filtered.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((value) => Math.max(value - 1, 0));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                const entry = filtered[active];
                if (entry) {
                  choose(entry.account, entry.model);
                }
              }
            }}
          />
          <button
            type="button"
            className="cp-menu-refresh"
            data-tip="Refresh models"
            aria-label="Refresh models"
            onClick={onRefresh}
          >
            <RefreshIcon />
          </button>
        </div>

        <div className="cp-menu-scroll" role="listbox" aria-label="Models">
          {accounts.map((account) => {
            const state = models[account.id];
            const group = filtered.filter((entry) => entry.account.id === account.id);
            if (query.trim() && group.length === 0) {
              return null;
            }
            return (
              <div key={account.id} className="cp-menu-group">
                <div className="cp-menu-label">
                  <span>{account.label}</span>
                  <span className="cp-menu-label-meta">{account.providerLabel}</span>
                </div>
                {state === 'loading' && <div className="cp-menu-empty">Loading models…</div>}
                {state && state !== 'loading' && 'error' in state && (
                  <div className="cp-menu-empty cp-menu-error">{state.error}</div>
                )}
                {Array.isArray(state) && group.length === 0 && query.trim() === '' && (
                  <div className="cp-menu-empty">No models returned</div>
                )}
                {group.map((entry) => {
                  const index = filtered.findIndex(
                    (candidate) =>
                      candidate.account.id === entry.account.id && candidate.model.id === entry.model.id,
                  );
                  const selected = entry.account.id === accountId && entry.model.id === model;
                  return (
                    <button
                      type="button"
                      key={`${entry.account.id}-${entry.model.id}`}
                      role="option"
                      aria-selected={selected}
                      className={`cp-menu-item ${selected ? 'cp-menu-item-selected' : ''} ${
                        index === active ? 'cp-menu-item-active' : ''
                      }`}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(entry.account, entry.model)}
                    >
                      <ModelIcon className="cp-menu-item-icon" />
                      <span className="cp-menu-item-main">
                        <span className="cp-menu-item-title">{entry.model.label || entry.model.id}</span>
                        {entry.model.label && entry.model.label !== entry.model.id && (
                          <span className="cp-menu-item-meta">{entry.model.id}</span>
                        )}
                      </span>
                      {selected && <CheckIcon className="cp-menu-check" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && !accounts.some((account) => models[account.id] === 'loading') && (
            <div className="cp-menu-empty">No matching models</div>
          )}
        </div>
      </Menu>
    </>
  );
}

export function ThinkingPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const selected = THINKING_OPTIONS.find((option) => option.value === value) ?? THINKING_OPTIONS[0];
  return (
    <>
      <PillTrigger
        icon={<ThinkingIcon />}
        value={selected.label}
        title="Thinking"
        kind="thinking"
        active={open}
        onClick={(element) => {
          setAnchor(element);
          setOpen((value) => !value);
        }}
      />
      <Menu open={open} anchor={anchor} onClose={() => setOpen(false)} width={230}>
        <div className="cp-menu-label">Thinking</div>
        {THINKING_OPTIONS.map((option) => (
          <button
            type="button"
            key={option.value}
            className={`cp-menu-item ${option.value === value ? 'cp-menu-item-selected' : ''}`}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            <span className="cp-menu-item-main">
              <span className="cp-menu-item-title">{option.label}</span>
              <span className="cp-menu-item-meta">{option.description}</span>
            </span>
            {option.value === value && <CheckIcon className="cp-menu-check" />}
          </button>
        ))}
      </Menu>
    </>
  );
}

export function SimpleSelect({
  value,
  options,
  placeholder,
  onSelect,
  icon,
  title,
}: {
  value: string;
  options: Array<{ value: string; label: string; description?: string }>;
  placeholder: string;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
  title?: string;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const selected = options.find((option) => option.value === value);
  return (
    <>
      <PillTrigger
        icon={icon ?? <ModelIcon />}
        value={selected?.label ?? placeholder}
        title={title}
        muted={!selected}
        active={open}
        onClick={(element) => {
          setAnchor(element);
          setOpen((value) => !value);
        }}
      />
      <Menu open={open} anchor={anchor} onClose={() => setOpen(false)} width={280}>
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={`cp-menu-item ${option.value === value ? 'cp-menu-item-selected' : ''}`}
            onClick={() => {
              onSelect(option.value);
              setOpen(false);
            }}
          >
            <span className="cp-menu-item-main">
              <span className="cp-menu-item-title">{option.label}</span>
              {option.description && <span className="cp-menu-item-meta">{option.description}</span>}
            </span>
            {option.value === value && <CheckIcon className="cp-menu-check" />}
          </button>
        ))}
      </Menu>
    </>
  );
}
