import { useState } from 'react';
import { listModels, setupProvider } from '../api';
import type { ModelInfo, SessionResponse } from '../types';

interface Props {
  session: SessionResponse;
  initialProvider?: string;
  initialBaseUrl?: string;
  onSaved: (provider: string, model: string, models: ModelInfo[]) => void;
  onCancel?: () => void;
}

export function SetupCard({
  session,
  initialProvider,
  initialBaseUrl,
  onSaved,
  onCancel,
}: Props): React.ReactElement {
  const providers = session.config.providers;
  const [provider, setProvider] = useState(
    initialProvider ?? session.config.defaultProvider ?? providers[0]?.id ?? 'openai',
  );
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl ?? '');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState(session.config.defaultModel ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const selected = providers.find((item) => item.id === provider);
  const isAdmin = session.isAdmin;

  const changeProvider = (id: string): void => {
    setProvider(id);
    setModels([]);
    setLoaded(false);
    setError(null);
    const info = providers.find((item) => item.id === id);
    setBaseUrl(info?.baseUrl ?? '');
  };

  const loadModels = async (): Promise<void> => {
    if (!apiKey.trim() && !selected?.configured) {
      setError('Paste the provider API key first');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const list = await listModels({
        provider,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        ...(baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}),
      });
      setModels(list);
      setLoaded(true);
      if (!model && list.length > 0) {
        setModel(list[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load models');
    } finally {
      setBusy(false);
    }
  };

  const save = async (): Promise<void> => {
    if (!apiKey.trim()) {
      setError('Paste the provider API key');
      return;
    }
    if (!model.trim() && models.length === 0) {
      setError('Load models or enter a model id');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await setupProvider({
        provider,
        apiKey: apiKey.trim(),
        ...(baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}),
        ...(model.trim() ? { model: model.trim() } : {}),
      });
      onSaved(result.provider, result.defaultModel, result.models);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the provider');
    } finally {
      setBusy(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="cp-setup">
        <h3>Assistant setup required</h3>
        <p>An administrator needs to choose a provider and add an API key before the assistant can answer.</p>
      </div>
    );
  }

  return (
    <div className="cp-setup">
      <h3>Set up Jenkins Copilot</h3>
      <p>
        Choose a provider, paste its API key, load models, and save. Keys are stored as Jenkins Secrets and
        are never shown again.
      </p>

      <div className="cp-provider-grid">
        {providers.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`cp-provider ${provider === item.id ? 'cp-provider-active' : ''}`}
            onClick={() => changeProvider(item.id)}
          >
            <span className="cp-provider-name">{item.label}</span>
            <span className={`cp-provider-state ${item.configured ? 'cp-configured' : ''}`}>
              {item.configured ? 'configured' : 'not configured'}
            </span>
          </button>
        ))}
      </div>

      <label className="cp-field">
        <span>API key</span>
        <input
          type="password"
          value={apiKey}
          autoComplete="off"
          placeholder={selected?.configured ? 'Paste a new key to replace the stored one' : 'sk-...'}
          onChange={(event) => setApiKey(event.target.value)}
        />
      </label>

      {provider === 'opencode-go' && (
        <label className="cp-field">
          <span>Base URL</span>
          <input
            type="url"
            value={baseUrl}
            placeholder="https://opencode.ai/inference/go"
            onChange={(event) => setBaseUrl(event.target.value)}
          />
          <span className="cp-field-hint">OpenCode Go: https://opencode.ai/inference/go</span>
        </label>
      )}

      <div className="cp-setup-actions">
        <button type="button" className="cp-btn" onClick={() => void loadModels()} disabled={busy}>
          {busy ? 'Checking…' : 'Load models'}
        </button>
        {loaded && <span className="cp-setup-note">{models.length} models found</span>}
      </div>

      {models.length > 0 ? (
        <label className="cp-field">
          <span>Model</span>
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            {models.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label || item.id}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="cp-field">
          <span>Model id (if the provider has no model list)</span>
          <input
            value={model}
            placeholder="gpt-5.1"
            onChange={(event) => setModel(event.target.value)}
          />
        </label>
      )}

      {error && <div className="cp-errline">{error}</div>}

      <div className="cp-setup-actions">
        <button type="button" className="cp-btn cp-primary" onClick={() => void save()} disabled={busy}>
          Test and save
        </button>
        {onCancel && (
          <button type="button" className="cp-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
