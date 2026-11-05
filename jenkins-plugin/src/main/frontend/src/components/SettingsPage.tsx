import { useEffect, useState } from 'react';
import {
  deleteGithubAccount,
  deleteProviderAccount,
  fetchProviderModels,
  saveGithubAccount,
  saveProviderAccount,
  setDefaultGithub,
  setDefaultProvider,
} from '../api';
import type { AccountsResponse, GitHubAccount, ModelInfo, ProviderAccount } from '../types';
import { SimpleSelect } from './Pickers';
import { SkillsPanel } from './SkillsPanel';
import {
  CopilotMark,
  CheckIcon,
  ChevronIcon,
  DefaultIcon,
  GearIcon,
  GitHubIcon,
  InfoIcon,
  MoonIcon,
  PaletteIcon,
  PencilIcon,
  ProviderIcon,
  RibbonIcon,
  SunIcon,
  TrashIcon,
} from './icons';
import { ACCENT_PRESETS, JENKINS_ACCENT, accentSource, readableOn } from '../accent';

const ABOUT = [
  'Jenkins AI Copilot is an agentic CI/CD assistant built into Jenkins. It diagnoses failing builds, ' +
    'reviews Jenkinsfiles, prepares fixes, and manages views, folders, jobs, queue items, agents, ' +
    'credentials, permissions, plugins, controller settings, and reusable skills — with privileged actions gated behind explicit approval ' +
    'and provider keys kept encrypted on the controller.',
  'Works with OpenAI, Claude, opencode go, or any OpenAI-compatible endpoint.',
];

const PROVIDER_TYPES = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Claude' },
  { id: 'opencode-go', label: 'opencode go' },
  { id: 'openai-compatible', label: 'Custom' },
];

interface ProviderForm {
  id?: string;
  provider: string;
  label: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  models: ModelInfo[];
  loading: boolean;
  error: string | null;
}

interface GitHubForm {
  id?: string;
  label: string;
  token: string;
  apiUrl: string;
}

function emptyProviderForm(provider = 'openai'): ProviderForm {
  return {
    provider,
    label: '',
    apiKey: '',
    baseUrl: provider === 'opencode-go' ? 'https://opencode.ai/inference/go' : '',
    model: '',
    models: [],
    loading: false,
    error: null,
  };
}

function emptyGithubForm(): GitHubForm {
  return { label: '', token: '', apiUrl: 'https://api.github.com' };
}

export function SettingsPage({
  accounts,
  isAdmin,
  version,
  theme,
  onThemeChange,
  accent,
  onAccentChange,
  onClose,
  onReload,
  onAccountsChanged,
  onStartSkillDraft,
}: {
  accounts: AccountsResponse | null;
  isAdmin: boolean;
  version: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  accent: string;
  onAccentChange: (accent: string) => void;
  onClose: () => void;
  onReload: () => Promise<void>;
  onAccountsChanged: (accounts: AccountsResponse) => void;
  onStartSkillDraft: (request: { name: string; folder: string; limit: number }) => void;
}): React.ReactElement {
  const [tab, setTab] = useState<'providers' | 'github' | 'appearance' | 'skills' | 'assistant' | 'about'>(
    isAdmin ? 'providers' : 'appearance',
  );
  const [providerForm, setProviderForm] = useState<ProviderForm | null>(null);
  const [githubForm, setGithubForm] = useState<GitHubForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [tab]);

  const providers = accounts?.providers ?? [];
  const github = accounts?.github ?? [];

  const reloadWith = async (next: AccountsResponse): Promise<void> => {
    onAccountsChanged(next);
    await onReload();
  };

  const loadModels = async (): Promise<void> => {
    if (!providerForm) return;
    if (!providerForm.apiKey.trim() && !providerForm.id) {
      setProviderForm({ ...providerForm, error: 'Paste an API key first' });
      return;
    }
    setProviderForm({ ...providerForm, loading: true, error: null });
    try {
      const result = await fetchProviderModels({
        ...(providerForm.id && !providerForm.apiKey.trim() ? { id: providerForm.id } : {}),
        ...(providerForm.apiKey.trim()
          ? {
              provider: providerForm.provider,
              apiKey: providerForm.apiKey.trim(),
              baseUrl: providerForm.baseUrl.trim(),
            }
          : {}),
      });
      setProviderForm((current) =>
        current
          ? {
              ...current,
              loading: false,
              models: result.models,
              model: current.model || result.models[0]?.id || '',
              error: result.models.length === 0 ? 'No models returned' : null,
            }
          : current,
      );
    } catch (loadError) {
      setProviderForm((current) =>
        current
          ? {
              ...current,
              loading: false,
              error: loadError instanceof Error ? loadError.message : 'Could not load models',
            }
          : current,
      );
    }
  };

  const saveProvider = async (): Promise<void> => {
    if (!providerForm) return;
    if (!providerForm.apiKey.trim() && !providerForm.id) {
      setProviderForm({ ...providerForm, error: 'Paste an API key first' });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await saveProviderAccount({
        ...(providerForm.id ? { id: providerForm.id } : {}),
        provider: providerForm.provider,
        label: providerForm.label.trim(),
        ...(providerForm.apiKey.trim() ? { apiKey: providerForm.apiKey.trim() } : {}),
        ...(providerForm.baseUrl.trim() ? { baseUrl: providerForm.baseUrl.trim() } : {}),
        ...(providerForm.model.trim() ? { defaultModel: providerForm.model.trim() } : {}),
      });
      setProviderForm(null);
      await reloadWith(result.accounts);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the provider');
    } finally {
      setSaving(false);
    }
  };

  const editProvider = (account: ProviderAccount): void => {
    setProviderForm({
      id: account.id,
      provider: account.provider,
      label: account.label,
      apiKey: '',
      baseUrl: account.baseUrl ?? '',
      model: account.defaultModel ?? '',
      models: [],
      loading: false,
      error: null,
    });
  };

  const saveGithub = async (): Promise<void> => {
    if (!githubForm) return;
    if (!githubForm.token.trim() && !githubForm.id) {
      setGithubForm({ ...githubForm, token: '' });
      setError('Paste a GitHub token first');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await saveGithubAccount({
        ...(githubForm.id ? { id: githubForm.id } : {}),
        label: githubForm.label.trim(),
        ...(githubForm.token.trim() ? { token: githubForm.token.trim() } : {}),
        apiUrl: githubForm.apiUrl.trim(),
      });
      setGithubForm(null);
      await reloadWith(result.accounts);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the GitHub token');
    } finally {
      setSaving(false);
    }
  };

  const providerOptions = providers.map((account) => ({
    value: account.id,
    label: account.label,
    description: account.providerLabel,
  }));

  return (
    <div className="cp-settings">
      <div className="cp-settings-head">
        <button type="button" className="cp-bar-btn" onClick={onClose} data-tip="Back" aria-label="Back">
          <ChevronIcon className="cp-back-chevron" />
        </button>
        <span className="cp-settings-title">Settings</span>
        <span className="cp-grow" />
      </div>

      <div className="cp-settings-tabs" role="tablist">
        {(
          [
            ['providers', 'Providers', <ProviderIcon key="p" />],
            ['github', 'GitHub', <GitHubIcon key="g" />],
            ['appearance', 'Appearance', <PaletteIcon key="a" />],
            ['skills', 'Skills', <RibbonIcon key="k" />],
            ['assistant', 'Assistant', <GearIcon key="s" />],
            ['about', 'About', <InfoIcon key="i" />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`cp-settings-tab ${tab === id ? 'cp-settings-tab-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {error && <div className="cp-errline">{error}</div>}

      <div className="cp-settings-scroll">
        {tab === 'providers' && (
          <section className="cp-settings-section">
            <div className="cp-settings-section-head">
              <div>
                <h3>Providers</h3>
                <p>Add multiple accounts. The model picker groups models by account.</p>
              </div>
              {isAdmin && !providerForm && (
                <button
                  type="button"
                  className="cp-btn cp-primary"
                  onClick={() => setProviderForm(emptyProviderForm())}
                >
                  Add provider
                </button>
              )}
            </div>

            {!isAdmin && <div className="cp-settings-note">Only administrators can manage provider accounts.</div>}

            {providers.map((account) => (
              <div className="cp-settings-card" key={account.id}>
                <div className="cp-settings-card-icon"><ProviderIcon /></div>
                <div className="cp-settings-card-main">
                  <div className="cp-settings-card-title">
                    {account.label}
                    {account.default && <span className="cp-settings-badge" role="img" tabIndex={0} aria-label="Default" data-tip="Default"><DefaultIcon /></span>}
                  </div>
                  <div className="cp-settings-card-meta">
                    {account.providerLabel}
                    {account.baseUrl ? ` · ${account.baseUrl}` : ''}
                    {account.defaultModel ? ` · ${account.defaultModel}` : ''}
                  </div>
                </div>
                {isAdmin && (
                  <div className="cp-settings-card-actions">
                    {!account.default && (
                      <button
                        type="button"
                        className="cp-iconbtn"
                        data-tip="Make default"
                        aria-label={`Make ${account.label} the default`}
                        onClick={() =>
                          void setDefaultProvider(account.id).then((result) => reloadWith(result.accounts))
                        }
                      >
                        <RibbonIcon />
                      </button>
                    )}
                    <button type="button" className="cp-iconbtn" data-tip="Edit" aria-label={`Edit ${account.label}`} onClick={() => editProvider(account)}>
                      <PencilIcon />
                    </button>
                    {deleteId === account.id ? (
                      <>
                        <button
                          type="button"
                          className="cp-btn cp-danger"
                          onClick={() =>
                            void deleteProviderAccount(account.id).then((result) => {
                              setDeleteId(null);
                              return reloadWith(result.accounts);
                            })
                          }
                        >
                          Confirm
                        </button>
                        <button type="button" className="cp-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="cp-iconbtn"
                        data-tip="Delete"
                        aria-label={`Delete ${account.label}`}
                        onClick={() => setDeleteId(account.id)}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isAdmin && providerForm && (
              <div className="cp-settings-form">
                <div className="cp-settings-form-head">
                  <strong>{providerForm.id ? 'Edit provider' : 'Add provider'}</strong>
                  <button type="button" className="cp-btn" onClick={() => setProviderForm(null)}>Cancel</button>
                </div>
                <div className="cp-provider-grid">
                  {PROVIDER_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      className={`cp-provider ${providerForm.provider === type.id ? 'cp-provider-active' : ''}`}
                      onClick={() =>
                        setProviderForm({
                          ...providerForm,
                          provider: type.id,
                          baseUrl:
                            type.id === 'opencode-go'
                              ? 'https://opencode.ai/inference/go'
                              : type.id === 'openai-compatible'
                                ? providerForm.baseUrl
                                : '',
                        })
                      }
                    >
                      <span className="cp-provider-name">{type.label}</span>
                    </button>
                  ))}
                </div>
                <label className="cp-field">
                  <span>Account label</span>
                  <input
                    value={providerForm.label}
                    placeholder="Work, Personal, …"
                    onChange={(event) => setProviderForm({ ...providerForm, label: event.target.value })}
                  />
                </label>
                <label className="cp-field">
                  <span>{providerForm.id ? 'Replace API key (optional)' : 'API key'}</span>
                  <input
                    type="password"
                    value={providerForm.apiKey}
                    autoComplete="off"
                    placeholder={providerForm.id ? 'Leave blank to keep the stored key' : 'sk-…'}
                    onChange={(event) => setProviderForm({ ...providerForm, apiKey: event.target.value })}
                  />
                </label>
                {(providerForm.provider === 'opencode-go' || providerForm.provider === 'openai-compatible') && (
                  <label className="cp-field">
                    <span>Base URL</span>
                    <input
                      value={providerForm.baseUrl}
                      placeholder="https://opencode.ai/inference/go"
                      onChange={(event) => setProviderForm({ ...providerForm, baseUrl: event.target.value })}
                    />
                    <span className="cp-field-hint">OpenCode Go: https://opencode.ai/inference/go</span>
                  </label>
                )}
                <div className="cp-settings-actions">
                  <button
                    type="button"
                    className="cp-btn"
                    onClick={() => void loadModels()}
                    disabled={providerForm.loading}
                  >
                    {providerForm.loading ? 'Loading…' : 'Load models'}
                  </button>
                  {providerForm.models.length > 0 && (
                    <SimpleSelect
                      icon={<ProviderIcon />}
                      title="Default model"
                      value={providerForm.model}
                      placeholder="Select model"
                      options={providerForm.models.map((model) => ({
                        value: model.id,
                        label: model.label || model.id,
                      }))}
                      onSelect={(value) => setProviderForm({ ...providerForm, model: value })}
                    />
                  )}
                </div>
                {providerForm.error && <div className="cp-errline">{providerForm.error}</div>}
                <div className="cp-settings-actions">
                  <button type="button" className="cp-btn cp-primary" onClick={() => void saveProvider()} disabled={saving}>
                    {saving ? 'Saving…' : 'Save provider'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'github' && (
          <section className="cp-settings-section">
            <div className="cp-settings-section-head">
              <div>
                <h3>GitHub</h3>
                <p>Repository tools use the default token. Multiple tokens are stored; one is active.</p>
              </div>
              {isAdmin && !githubForm && (
                <button type="button" className="cp-btn cp-primary" onClick={() => setGithubForm(emptyGithubForm())}>
                  Add token
                </button>
              )}
            </div>

            {!isAdmin && <div className="cp-settings-note">Only administrators can manage GitHub tokens.</div>}

            {github.map((account) => (
              <div className="cp-settings-card" key={account.id}>
                <div className="cp-settings-card-icon"><GitHubIcon /></div>
                <div className="cp-settings-card-main">
                  <div className="cp-settings-card-title">
                    {account.label}
                    {account.default && <span className="cp-settings-badge" role="img" tabIndex={0} aria-label="Default" data-tip="Default"><DefaultIcon /></span>}
                  </div>
                  <div className="cp-settings-card-meta">{account.apiUrl} · token stored</div>
                </div>
                {isAdmin && (
                  <div className="cp-settings-card-actions">
                    {!account.default && (
                      <button
                        type="button"
                        className="cp-iconbtn"
                        data-tip="Make default"
                        aria-label={`Make ${account.label} the default`}
                        onClick={() => void setDefaultGithub(account.id).then((result) => reloadWith(result.accounts))}
                      >
                        <RibbonIcon />
                      </button>
                    )}
                    <button
                      type="button"
                      className="cp-iconbtn"
                      data-tip="Edit"
                      aria-label={`Edit ${account.label}`}
                      onClick={() =>
                        setGithubForm({
                          id: account.id,
                          label: account.label,
                          token: '',
                          apiUrl: account.apiUrl,
                        })
                      }
                    >
                      <PencilIcon />
                    </button>
                    {deleteId === account.id ? (
                      <>
                        <button
                          type="button"
                          className="cp-btn cp-danger"
                          onClick={() =>
                            void deleteGithubAccount(account.id).then((result) => {
                              setDeleteId(null);
                              return reloadWith(result.accounts);
                            })
                          }
                        >
                          Confirm
                        </button>
                        <button type="button" className="cp-btn" onClick={() => setDeleteId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="cp-iconbtn"
                        data-tip="Delete"
                        aria-label={`Delete ${account.label}`}
                        onClick={() => setDeleteId(account.id)}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isAdmin && githubForm && (
              <div className="cp-settings-form">
                <div className="cp-settings-form-head">
                  <strong>{githubForm.id ? 'Edit token' : 'Add token'}</strong>
                  <button type="button" className="cp-btn" onClick={() => setGithubForm(null)}>Cancel</button>
                </div>
                <label className="cp-field">
                  <span>Label</span>
                  <input
                    value={githubForm.label}
                    placeholder="Work, Personal, …"
                    onChange={(event) => setGithubForm({ ...githubForm, label: event.target.value })}
                  />
                </label>
                <label className="cp-field">
                  <span>{githubForm.id ? 'Replace token (optional)' : 'Personal access token'}</span>
                  <input
                    type="password"
                    value={githubForm.token}
                    autoComplete="off"
                    placeholder={githubForm.id ? 'Leave blank to keep the stored token' : 'ghp_…'}
                    onChange={(event) => setGithubForm({ ...githubForm, token: event.target.value })}
                  />
                </label>
                <label className="cp-field">
                  <span>GitHub API URL</span>
                  <input
                    value={githubForm.apiUrl}
                    onChange={(event) => setGithubForm({ ...githubForm, apiUrl: event.target.value })}
                  />
                </label>
                <div className="cp-settings-actions">
                  <button type="button" className="cp-btn cp-primary" onClick={() => void saveGithub()} disabled={saving}>
                    {saving ? 'Saving…' : 'Save token'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === 'appearance' && (
          <AppearanceSection
            theme={theme}
            onThemeChange={onThemeChange}
            accent={accent}
            onAccentChange={onAccentChange}
          />
        )}

        {tab === 'skills' && (
          <SkillsPanel isAdmin={isAdmin} onStartDraft={onStartSkillDraft} />
        )}

        {tab === 'assistant' && (
          <section className="cp-settings-section">
            <h3>Assistant</h3>
            <p>Defaults used for new sessions. Each session can switch provider and model.</p>
            <div className="cp-settings-row">
              <span>Default provider</span>
              <SimpleSelect
                title="Default provider"
                value={accounts?.defaultProviderId ?? ''}
                placeholder="No provider"
                options={providerOptions}
                icon={<ProviderIcon />}
                onSelect={(value) => {
                  if (!isAdmin) return;
                  void setDefaultProvider(value).then((result) => reloadWith(result.accounts));
                }}
              />
            </div>
            <div className="cp-settings-note">
              Provider keys are stored as Jenkins Secrets. GitHub tools use the default token.
            </div>
          </section>
        )}

        {tab === 'about' && (
          <section className="cp-settings-section">
            <div className="cp-about-head">
              <h3>Jenkins AI Copilot</h3>
              <span className="cp-settings-version">v{version}</span>
            </div>
            {ABOUT.map((line) => (
              <p className="cp-about-lede" key={line}>{line}</p>
            ))}
            <div className="cp-settings-note">
              Sessions live under <code>$JENKINS_HOME/jenkins-ai-copilot</code> and stay scoped to their owner.
              Provider keys are Jenkins Secrets and only leave the controller for the configured provider.
            </div>
            <p>
              <a href="/manage/configure" target="_blank" rel="noreferrer">Advanced configuration</a>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

const swatchVars = (color: string): React.CSSProperties =>
  ({ '--cp-swatch': color, '--cp-swatch-on': readableOn(color) }) as React.CSSProperties;

function AppearanceSection({
  theme,
  onThemeChange,
  accent,
  onAccentChange,
}: {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  accent: string;
  onAccentChange: (accent: string) => void;
}): React.ReactElement {
  const preset = ACCENT_PRESETS.find((item) => item.id === accent);
  const name = preset?.label ?? 'Follow Jenkins';
  return (
    <section className="cp-settings-section">
      <div>
        <h3>Appearance</h3>
        <p>Saved in this browser, for you only.</p>
      </div>

      <div className="cp-settings-row">
        <span>Theme</span>
        <div className="cp-segment">
          <button type="button" aria-pressed={theme === 'light'} onClick={() => onThemeChange('light')}>
            <SunIcon /> Light
          </button>
          <button type="button" aria-pressed={theme === 'dark'} onClick={() => onThemeChange('dark')}>
            <MoonIcon /> Dark
          </button>
        </div>
      </div>

      <h4>Primary colour</h4>
      <div className="cp-swatches" role="group" aria-label="Primary colour">
        {ACCENT_PRESETS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`cp-swatch ${accent === item.id ? 'cp-swatch-active' : ''}`}
            style={swatchVars(item[theme])}
            data-tip={item.label}
            aria-label={item.label}
            aria-pressed={accent === item.id}
            onClick={() => onAccentChange(item.id)}
          >
            {accent === item.id && <CheckIcon />}
          </button>
        ))}
        <button
          type="button"
          className={`cp-swatch ${accent === JENKINS_ACCENT ? 'cp-swatch-active' : ''}`}
          style={swatchVars(accentSource(JENKINS_ACCENT, theme))}
          data-tip="Follow Jenkins: uses this controller's accent colour"
          aria-label="Follow Jenkins"
          aria-pressed={accent === JENKINS_ACCENT}
          onClick={() => onAccentChange(JENKINS_ACCENT)}
        >
          {accent === JENKINS_ACCENT ? <CheckIcon /> : <CopilotMark />}
        </button>
      </div>
      <div className="cp-accent-name">
        <b>{name}</b>
      </div>

      <div className="cp-accent-preview" aria-hidden="true">
        <CopilotMark className="cp-accent-mark" />
        <span className="cp-btn cp-primary">Approve and run</span>
        <span className="cp-accent-link">A link in a reply</span>
      </div>
    </section>
  );
}
