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
import { CheckIcon, GitHubIcon, PencilIcon, ProviderIcon, TrashIcon } from './icons';

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
  onClose,
  onReload,
  onAccountsChanged,
}: {
  accounts: AccountsResponse | null;
  isAdmin: boolean;
  version: string;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  onClose: () => void;
  onReload: () => Promise<void>;
  onAccountsChanged: (accounts: AccountsResponse) => void;
}): React.ReactElement {
  const [tab, setTab] = useState<'providers' | 'github' | 'assistant' | 'about'>('providers');
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
        <button type="button" className="cp-bar-btn" onClick={onClose} title="Back to chat" aria-label="Back to chat">
          <span className="cp-settings-back">←</span>
        </button>
        <span className="cp-settings-title">Settings</span>
        <span className="cp-grow" />
      </div>

      <div className="cp-settings-tabs" role="tablist">
        {[
          ['providers', 'Providers'],
          ['github', 'GitHub'],
          ['assistant', 'Assistant'],
          ['about', 'About'],
        ].map(([id, label]) => (
          <button
            type="button"
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`cp-settings-tab ${tab === id ? 'cp-settings-tab-active' : ''}`}
            onClick={() => setTab(id as typeof tab)}
          >
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
                    {account.default && <span className="cp-settings-badge"><CheckIcon /> default</span>}
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
                        className="cp-btn"
                        onClick={() =>
                          void setDefaultProvider(account.id).then((result) => reloadWith(result.accounts))
                        }
                      >
                        Set default
                      </button>
                    )}
                    <button type="button" className="cp-iconbtn" title="Edit" onClick={() => editProvider(account)}>
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
                        title="Delete"
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
                    {account.default && <span className="cp-settings-badge"><CheckIcon /> default</span>}
                  </div>
                  <div className="cp-settings-card-meta">{account.apiUrl} · token stored</div>
                </div>
                {isAdmin && (
                  <div className="cp-settings-card-actions">
                    {!account.default && (
                      <button
                        type="button"
                        className="cp-btn"
                        onClick={() => void setDefaultGithub(account.id).then((result) => reloadWith(result.accounts))}
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      className="cp-iconbtn"
                      title="Edit"
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
                        title="Delete"
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
            <div className="cp-settings-row">
              <span>Theme</span>
              <div className="cp-settings-actions">
                <button
                  type="button"
                  className={`cp-btn ${theme === 'dark' ? 'cp-primary' : ''}`}
                  onClick={() => onThemeChange('dark')}
                >
                  Dark
                </button>
                <button
                  type="button"
                  className={`cp-btn ${theme === 'light' ? 'cp-primary' : ''}`}
                  onClick={() => onThemeChange('light')}
                >
                  Light
                </button>
              </div>
            </div>
            <div className="cp-settings-note">
              Provider keys are stored as Jenkins Secrets. GitHub tools use the default token.
            </div>
          </section>
        )}

        {tab === 'about' && (
          <section className="cp-settings-section">
            <h3>Jenkins AI Copilot</h3>
            <p>Version {version}</p>
            <p>
              Sessions are stored under <code>$JENKINS_HOME/jenkins-ai-copilot</code>. Keys never leave the
              Jenkins controller except to the configured provider.
            </p>
            <p>
              <a href="/manage/configure" target="_blank" rel="noreferrer">Advanced configuration</a>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
