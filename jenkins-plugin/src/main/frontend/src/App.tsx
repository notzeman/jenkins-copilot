import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  attachmentUrl,
  deleteConversation,
  listConversations,
  listModels,
  loadConversation,
  loadSession,
  runtime,
  streamChat,
  streamDecision,
} from './api';
import { prepareAttachment, type LocalAttachment } from './attachments';
import type { Item, ModelInfo, ServerEvent, SessionResponse, StoredConversation } from './types';
import { Markdown } from './components/Markdown';
import { ToolCard } from './components/ToolCard';
import { ApprovalCard } from './components/ApprovalCard';
import { SetupCard } from './components/SetupCard';
import {
  ChevronIcon,
  MoonIcon,
  ModelIcon,
  PaperclipIcon,
  ProviderIcon,
  RefreshIcon,
  ShieldIcon,
  StopIcon,
  SunIcon,
  ThinkingIcon,
  TrashIcon,
  XIcon,
} from './components/icons';

type ApprovalItem = Extract<Item, { kind: 'approval' }>;

const ChatIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V5.5Z" />
    <path d="M8 8.5h8M8 11.5h5" strokeLinecap="round" />
  </svg>
);

const CloseIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

const PlusIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const GearIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.36.36.7.6 1 .3.3.7.4 1.1.4H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.6Z" />
  </svg>
);

const ExpandIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" strokeLinecap="round" />
  </svg>
);

const SendIcon = (): React.ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 12 20 4l-5 16-4-6-7-2Z" strokeLinejoin="round" />
  </svg>
);



export function App(): React.ReactElement {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem('cp.width'));
    return Number.isFinite(saved) && saved >= 360 && saved <= 760 ? saved : 440;
  });
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<
    Array<{ id: string; title: string; status: string; updatedAt: number; provider: string; model: string }>
  >([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'thinking' | 'tools' | 'streaming' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [thinking, setThinking] = useState(() => localStorage.getItem('cp.thinking') ?? 'AUTO');
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cp.theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamingId = useRef<string | null>(null);
  const modelRef = useRef(model);
  modelRef.current = model;

  const refreshModels = useCallback(async (providerId: string, keepModel = true) => {
    setModelsLoading(true);
    try {
      const list = await listModels({ provider: providerId });
      setModels(list);
      setModel((current) => {
        if (keepModel && current) {
          return current;
        }
        return list[0]?.id ?? current;
      });
    } catch (loadError) {
      setModels([]);
      setError(loadError instanceof Error ? loadError.message : 'Could not load models');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await loadSession();
        setSession(loaded);
        const configured = loaded.config.providers.filter((item) => item.configured);
        const preferred =
          configured.find((item) => item.id === loaded.config.defaultProvider)?.id ??
          configured[0]?.id ??
          loaded.config.defaultProvider;
        setProvider(preferred);
        setModel(loaded.config.defaultModel ?? '');
        setSetupMode(loaded.config.setupRequired && loaded.isAdmin);
        if (loaded.authenticated && !loaded.config.setupRequired) {
          setConversations(await listConversations());
          void refreshModels(preferred, Boolean(loaded.config.defaultModel));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the assistant');
      }
    })();
  }, [refreshModels]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => textareaRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return;
    }
    const nearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 140;
    if (nearBottom) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [items, busy]);

  const context = {
    ...(runtime.context as Record<string, unknown>),
    ...((session?.context ?? {}) as Record<string, unknown>),
  };
  const jobName = typeof context.jobFullName === 'string' ? context.jobFullName : undefined;
  const buildNumber = typeof context.buildNumber === 'number' ? context.buildNumber : undefined;
  const buildResult = typeof context.buildResult === 'string' ? context.buildResult : null;
  const configuredProviders = session?.config.providers.filter((item) => item.configured) ?? [];

  const addItem = useCallback((item: Item) => {
    setItems((current) => [...current, item]);
  }, []);

  const updateTool = useCallback(
    (toolCallId: string, patch: Partial<Extract<Item, { kind: 'tool' }>>) => {
      setItems((current) =>
        current.map((item) =>
          item.kind === 'tool' && item.toolCallId === toolCallId ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      switch (event.event) {
        case 'conversation':
          setConversationId(event.data.id);
          break;
        case 'message.reasoning':
          setPhase('thinking');
          break;
        case 'message.delta': {
          setPhase('streaming');
          const existing = streamingId.current;
          if (existing) {
            setItems((current) =>
              current.map((item) =>
                item.kind === 'message' && item.id === existing
                  ? { ...item, text: item.text + event.data.text, streaming: true }
                  : item,
              ),
            );
          } else {
            const newId = `assistant-${Date.now()}`;
            streamingId.current = newId;
            setItems((current) => [
              ...current,
              { kind: 'message', id: newId, role: 'assistant', text: event.data.text, streaming: true },
            ]);
          }
          break;
        }
        case 'message.completed': {
          const existing = streamingId.current;
          streamingId.current = null;
          setPhase(null);
          if (existing) {
            setItems((current) =>
              current.map((item) =>
                item.kind === 'message' && item.id === existing
                  ? { ...item, text: event.data.text || item.text, streaming: false }
                  : item,
              ),
            );
          } else if (event.data.text.trim()) {
            setItems((current) => [
              ...current,
              {
                kind: 'message',
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                text: event.data.text,
                streaming: false,
              },
            ]);
          }
          break;
        }
        case 'tool.start':
          setPhase('tools');
          addItem({
            kind: 'tool',
            id: `tool-${event.data.toolCallId}`,
            toolCallId: event.data.toolCallId,
            toolName: event.data.toolName,
            args: event.data.args,
            status: 'running',
            risk: event.data.risk,
            reason: event.data.reason,
          });
          break;
        case 'tool.result':
          updateTool(event.data.toolCallId, {
            status: 'succeeded',
            output: event.data.output,
          });
          break;
        case 'tool.error':
          updateTool(event.data.toolCallId, { status: 'failed', error: event.data.error });
          break;
        case 'approval.required': {
          const next: ApprovalItem = {
            kind: 'approval',
            id: `approval-${event.data.approvalId}`,
            approvalId: event.data.approvalId,
            toolCallId: event.data.toolCallId,
            toolName: event.data.toolName,
            target: event.data.target,
            args: event.data.args,
            risk: event.data.risk,
            reason: event.data.reason,
            diff: event.data.diff,
            validation: event.data.validation,
            expiresAt: event.data.expiresAt,
            status: 'pending',
          };
          setItems((current) =>
            current.some((item) => item.kind === 'approval' && item.approvalId === next.approvalId)
              ? current.map((item) =>
                  item.kind === 'approval' && item.approvalId === next.approvalId ? next : item,
                )
              : [...current, next],
          );
          break;
        }
        case 'error':
          addItem({ kind: 'error', id: `error-${Date.now()}`, text: event.data.message });
          break;
        case 'done':
          setBusy(false);
          setPhase(null);
          void listConversations().then(setConversations).catch(() => undefined);
          break;
        default:
          break;
      }
    },
    [addItem, updateTool],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const maxMb = session?.config.maxAttachmentMb ?? 5;
      const next: LocalAttachment[] = [];
      for (const file of files.slice(0, Math.max(0, 4 - attachments.length))) {
        try {
          next.push(await prepareAttachment(file, maxMb));
        } catch (attachmentError) {
          setError(attachmentError instanceof Error ? attachmentError.message : 'Could not attach the image');
        }
      }
      if (next.length > 0) {
        setAttachments((current) => [...current, ...next].slice(0, 4));
      }
    },
    [attachments.length, session?.config.maxAttachmentMb],
  );

  const send = useCallback(
    async (text: string) => {
      const message = text.trim();
      if (busy || (!message && attachments.length === 0)) {
        return;
      }
      if (!session || session.config.setupRequired) {
        setSetupMode(true);
        return;
      }
      if (configuredProviders.length === 0) {
        setSetupMode(true);
        return;
      }
      if (!model) {
        setError('Choose a model first');
        return;
      }
      setError(null);
      setInput('');
      addItem({
        kind: 'message',
        id: `user-${Date.now()}`,
        role: 'user',
        text: message,
        images: attachments.map((item) => ({ url: item.previewUrl, fileName: item.fileName })),
      });
      const outgoing = attachments;
      setAttachments([]);
      const controller = new AbortController();
      abortRef.current = controller;
      streamingId.current = null;
      setBusy(true);
      setPhase('thinking');
      try {
        await streamChat(
          {
            conversationId,
            message,
            provider,
            model,
            thinking,
            context,
            ...(outgoing.length > 0
              ? {
                  attachments: outgoing.map((item) => ({
                    mediaType: item.mediaType,
                    fileName: item.fileName,
                    dataBase64: item.dataBase64,
                  })),
                }
              : {}),
          },
          handleEvent,
          controller.signal,
        );
      } catch (sendError) {
        if (!controller.signal.aborted) {
          addItem({
            kind: 'error',
            id: `error-${Date.now()}`,
            text: sendError instanceof Error ? sendError.message : 'Request failed',
          });
        }
      } finally {
        setBusy(false);
        setPhase(null);
        abortRef.current = null;
      }
    },
    [addItem, attachments, busy, configuredProviders.length, conversationId, handleEvent, model, provider, session, thinking],
  );

  const decide = useCallback(
    async (approval: ApprovalItem, approved: boolean, comment: string) => {
      if (!conversationId) {
        return;
      }
      setItems((current) =>
        current.map((item) =>
          item.kind === 'approval' && item.approvalId === approval.approvalId
            ? { ...item, status: approved ? 'approved' : 'rejected' }
            : item,
        ),
      );
      const controller = new AbortController();
      abortRef.current = controller;
      streamingId.current = null;
      setBusy(true);
      setPhase('thinking');
      setError(null);
      try {
        await streamDecision(
          { conversationId, approvalId: approval.approvalId, approved, comment, context },
          handleEvent,
          controller.signal,
        );
      } catch (decisionError) {
        setItems((current) =>
          current.map((item) =>
            item.kind === 'approval' && item.approvalId === approval.approvalId
              ? { ...item, status: 'pending' }
              : item,
          ),
        );
        addItem({
          kind: 'error',
          id: `error-${Date.now()}`,
          text: decisionError instanceof Error ? decisionError.message : 'Decision failed',
        });
      } finally {
        setBusy(false);
        setPhase(null);
        abortRef.current = null;
      }
    },
    [addItem, busy, conversationId, handleEvent],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
    setPhase(null);
    setItems((current) =>
      current.map((item) =>
        item.kind === 'message' && item.streaming ? { ...item, streaming: false } : item,
      ),
    );
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    streamingId.current = null;
    setConversationId(undefined);
    setItems([]);
    setError(null);
    setInput('');
    setAttachments([]);
    setBusy(false);
    setPhase(null);
  }, []);

  const deleteCurrent = useCallback(async () => {
    if (conversationId) {
      try {
        await deleteConversation(conversationId);
        setConversations(await listConversations());
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the conversation');
      }
    }
    reset();
  }, [conversationId, reset]);

  const selectConversation = useCallback(
    async (id: string) => {
      if (!id) {
        reset();
        return;
      }
      abortRef.current?.abort();
      streamingId.current = null;
      setBusy(false);
      try {
        const stored: StoredConversation = await loadConversation(id);
        setItems(mapStoredConversation(stored, id));
        setConversationId(id);
        const nextProvider = stored.conversation.provider || provider;
        setProvider(nextProvider);
        setThinking(stored.conversation.thinking || 'AUTO');
        setModel(stored.conversation.model || model);
        if (stored.conversation.provider) {
          void refreshModels(stored.conversation.provider, true);
        }
        setSetupMode(false);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the conversation');
      }
    },
    [model, provider, refreshModels, reset],
  );

  const startResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const onMove = (moveEvent: PointerEvent): void => {
      const next = Math.min(Math.max(window.innerWidth - moveEvent.clientX, 360), 760);
      setWidth(next);
    };
    const onUp = (): void => {
      setWidth((value) => {
        localStorage.setItem('cp.width', String(value));
        return value;
      });
      target.releasePointerCapture(event.pointerId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, []);

  const drawerWidth = expanded ? Math.min(760, Math.max(width, 640)) : width;
  const quickActions = useMemo(() => {
    const actions = [
      'List my agents and executor usage',
      'Show the jobs with failing builds',
      'Analyze my pipelines for build-time and Docker storage improvements',
    ];
    if (jobName) {
      actions.unshift(
        `Why did the latest build of ${jobName} fail?`,
        `Analyze the pipeline for ${jobName}`,
      );
    }
    return actions.slice(0, 4);
  }, [jobName]);

  const setupRequired = session?.config.setupRequired ?? true;
  const showSetup = setupMode || (setupRequired && session?.isAdmin !== false);
  const selectedModelLabel =
    models.find((item) => item.id === model)?.label || model || 'select model';

  return (
    <div className="cp-shell" data-theme={theme}>
      {!open && (
        <button
          type="button"
          className="cp-fab"
          aria-label="Open Jenkins Copilot"
          title="Jenkins Copilot (Ctrl+J)"
          onClick={() => setOpen(true)}
        >
          <ChatIcon />
        </button>
      )}
      <aside
        className={`cp-drawer ${open ? 'cp-open' : ''}`}
        style={{ width: drawerWidth }}
        aria-label="Jenkins Copilot"
        aria-hidden={!open}
      >
        <div
          className="cp-resize"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant"
          onPointerDown={startResize}
        />
        <header className="cp-head">
          <div className="cp-head-row">
            <div className="cp-logo">
              <ChatIcon />
            </div>
            <div>
              <div className="cp-title">Jenkins Copilot</div>
              <div className="cp-sub">{session?.user ? `@${session.user}` : 'agentic CI/CD operator'}</div>
            </div>
            <div className="cp-grow" />
            {session?.isAdmin && (
              <button
                type="button"
                className="cp-iconbtn"
                title="Providers and models"
                aria-label="Providers and models"
                onClick={() => setSetupMode((value) => !value)}
              >
                <GearIcon />
              </button>
            )}
            <button
              type="button"
              className="cp-iconbtn"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                localStorage.setItem('cp.theme', next);
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              className="cp-iconbtn"
              title="Expand"
              aria-label="Expand assistant"
              onClick={() => setExpanded((value) => !value)}
            >
              <ExpandIcon />
            </button>
            <button
              type="button"
              className="cp-iconbtn"
              title="New conversation"
              aria-label="New conversation"
              onClick={reset}
            >
              <PlusIcon />
            </button>
            <button
              type="button"
              className="cp-iconbtn"
              title="Close"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="cp-convbar">
            <select
              className="cp-select"
              aria-label="Conversation history"
              value={conversationId ?? ''}
              onChange={(event) => void selectConversation(event.target.value)}
            >
              <option value="">New conversation</option>
              {conversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {conversation.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="cp-iconbtn"
              title="Delete this conversation"
              aria-label="Delete this conversation"
              onClick={() => void deleteCurrent()}
            >
              <TrashIcon />
            </button>
          </div>

          <div className="cp-chips">
            {jobName && (
              <span className="cp-chip" title={jobName}>
                job <b>{jobName}</b>
              </span>
            )}
            {buildNumber !== undefined && (
              <span
                className={`cp-chip ${
                  buildResult === 'FAILURE' ? 'cp-fail' : buildResult === 'SUCCESS' ? 'cp-ok' : ''
                }`}
              >
                build <b>#{buildNumber}</b>
                {buildResult ? ` · ${buildResult}` : ''}
              </span>
            )}
            {!jobName && <span className="cp-chip">no job context</span>}
            {setupRequired && <span className="cp-chip cp-fail">setup required</span>}
            {!session?.config.githubConfigured && <span className="cp-chip">GitHub not configured</span>}
          </div>
        </header>

        {error && <div className="cp-banner">{error}</div>}

        {showSetup && session ? (
          <div className="cp-thread">
            <SetupCard
              session={session}
              initialProvider={provider}
              initialBaseUrl={configuredProviders.find((item) => item.id === provider)?.baseUrl}
              onCancel={
                !setupRequired
                  ? () => {
                      setSetupMode(false);
                      setError(null);
                    }
                  : undefined
              }
              onSaved={(savedProvider, savedModel, savedModels) => {
                setProvider(savedProvider);
                setModel(savedModel);
                setModels(savedModels);
                setSession((current) =>
                  current
                    ? {
                        ...current,
                        config: {
                          ...current.config,
                          setupRequired: false,
                          defaultProvider: savedProvider,
                          defaultModel: savedModel,
                          providers: current.config.providers.map((item) =>
                            item.id === savedProvider ? { ...item, configured: true } : item,
                          ),
                        },
                      }
                    : current,
                );
                setSetupMode(false);
                setError(null);
                void listConversations().then(setConversations).catch(() => undefined);
              }}
            />
          </div>
        ) : (
          <>
            <div className="cp-thread" ref={threadRef}>
              {items.length === 0 && (
                <div className="cp-empty">
                  <h3>What are we fixing?</h3>
                  <p>
                    I can inspect jobs and builds, diagnose failures, generate and review Jenkinsfiles, and
                    prepare approved pipeline or deployment recovery changes.
                  </p>
                  <div className="cp-quick">
                    {quickActions.map((action) => (
                      <button key={action} type="button" onClick={() => void send(action)}>
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {items.map((item) => {
                if (item.kind === 'message') {
                  return (
                    <div className={`cp-msg ${item.role === 'user' ? 'cp-user' : ''}`} key={item.id}>
                      <div className="cp-msg-head">
                        <span className="cp-dot" />
                        {item.role === 'user' ? 'You' : 'Copilot'}
                      </div>
                      {item.role === 'user' ? (
                        <>
                          <div className="cp-msg-body" style={{ whiteSpace: 'pre-wrap' }}>
                            {item.text}
                          </div>
                          {item.images && item.images.length > 0 && (
                            <div className="cp-thumbs">
                              {item.images.map((image) => (
                                <span className="cp-thumb" key={image.url}>
                                  <img src={image.url} alt={image.fileName ?? 'attachment'} />
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <Markdown text={item.text} />
                          {item.streaming && <span className="cp-cursor" aria-label="Streaming" />}
                        </>
                      )}
                    </div>
                  );
                }
                if (item.kind === 'tool') {
                  return <ToolCard item={item} key={item.id} />;
                }
                if (item.kind === 'approval') {
                  return <ApprovalCard item={item} key={item.id} onDecide={decide} />;
                }
                return (
                  <div className="cp-errline" key={item.id} role="alert">
                    {item.text}
                  </div>
                );
              })}
            </div>

            <div
              className="cp-composer"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const files = Array.from(event.dataTransfer.files).filter((file) =>
                  file.type.startsWith('image/'),
                );
                if (files.length > 0) {
                  void addFiles(files);
                }
              }}
            >
              {attachments.length > 0 && (
                <div className="cp-thumbs">
                  {attachments.map((attachment, index) => (
                    <span className="cp-thumb" key={`${attachment.fileName}-${index}`}>
                      <img src={attachment.previewUrl} alt={attachment.fileName} />
                      <button
                        type="button"
                        aria-label={`Remove ${attachment.fileName}`}
                        onClick={() =>
                          setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))
                        }
                      >
                        <XIcon />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="cp-composer-box">
                <textarea
                  ref={textareaRef}
                  className="cp-textarea"
                  placeholder={
                    busy
                      ? phase === 'thinking'
                        ? 'Thinking…'
                        : phase === 'tools'
                          ? 'Running tools…'
                          : 'Working…'
                      : setupRequired
                        ? 'Finish provider setup first…'
                        : jobName
                          ? `Ask about ${jobName}…`
                          : 'Ask about a job, build, pipeline, or deployment…'
                  }
                  value={input}
                  rows={1}
                  disabled={busy}
                  onChange={(event) => {
                    setInput(event.target.value);
                    event.target.style.height = 'auto';
                    event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
                  }}
                  onPaste={(event) => {
                    const files = Array.from(event.clipboardData.files).filter((file) =>
                      file.type.startsWith('image/'),
                    );
                    if (files.length > 0) {
                      event.preventDefault();
                      void addFiles(files);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  aria-label="Message"
                />

                <div className="cp-composer-bar">
                  <div className="cp-bar-left">
                    <button
                      type="button"
                      className="cp-bar-btn"
                      title="Attach image"
                      aria-label="Attach image"
                      onClick={() => fileRef.current?.click()}
                    >
                      <PaperclipIcon />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      hidden
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        event.target.value = '';
                        if (files.length > 0) {
                          void addFiles(files);
                        }
                      }}
                    />
                    <span
                      className="cp-shield"
                      title="Privileged actions require human approval"
                      aria-label="Privileged actions require human approval"
                    >
                      <ShieldIcon />
                    </span>
                  </div>

                  <div className="cp-bar-right">
                    {configuredProviders.length > 0 && (
                      <label className="cp-pill" title="Provider">
                        <ProviderIcon className="cp-pill-icon" />
                        <select
                          className="cp-pill-native"
                          aria-label="Provider"
                          value={provider}
                          onChange={(event) => {
                            const next = event.target.value;
                            setProvider(next);
                            setModel('');
                            void refreshModels(next, false);
                          }}
                        >
                          {configuredProviders.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <ChevronIcon className="cp-pill-chevron" />
                      </label>
                    )}

                    <label className="cp-pill cp-pill-model" title="Model">
                      <ModelIcon className="cp-pill-icon" />
                      {models.length > 0 ? (
                        <select
                          className="cp-pill-native"
                          aria-label="Model"
                          value={model}
                          onChange={(event) => setModel(event.target.value)}
                        >
                          {models.some((item) => item.id === model) ? null : (
                            <option value={model}>{selectedModelLabel}</option>
                          )}
                          {models.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label || item.id}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="cp-pill-input"
                          aria-label="Model id"
                          placeholder={modelsLoading ? 'loading…' : 'model id'}
                          value={model}
                          onChange={(event) => setModel(event.target.value)}
                        />
                      )}
                      <ChevronIcon className="cp-pill-chevron" />
                    </label>

                    <label className="cp-pill" title={`Thinking: ${thinking.toLowerCase()}`}>
                      <ThinkingIcon className="cp-pill-icon" />
                      <select
                        className="cp-pill-native cp-thinking-native"
                        aria-label="Thinking"
                        value={thinking}
                        onChange={(event) => {
                          setThinking(event.target.value);
                          localStorage.setItem('cp.thinking', event.target.value);
                        }}
                      >
                        <option value="AUTO">Auto</option>
                        <option value="OFF">Off</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                      <ChevronIcon className="cp-pill-chevron" />
                    </label>

                    <button
                      type="button"
                      className="cp-bar-btn"
                      title="Refresh models"
                      aria-label="Refresh models"
                      onClick={() => void refreshModels(provider, true)}
                    >
                      <RefreshIcon />
                    </button>

                    {busy ? (
                      <button type="button" className="cp-send" onClick={stop} aria-label="Stop">
                        <StopIcon />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="cp-send"
                        onClick={() => void send(input)}
                        disabled={!input.trim() && attachments.length === 0}
                        aria-label="Send"
                      >
                        <SendIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function mapStoredConversation(stored: StoredConversation, conversationId: string): Item[] {
  const items: Item[] = [];
  const results = new Map<string, StoredConversation['messages'][number]>();
  for (const message of stored.messages) {
    if (message.role === 'TOOL' && message.toolCallId) {
      results.set(message.toolCallId, message);
    }
  }
  for (const message of stored.messages) {
    if (message.role === 'USER') {
      items.push({
        kind: 'message',
        id: `user-${items.length}-${message.content.slice(0, 12)}`,
        role: 'user',
        text: message.content,
        images: (message.images ?? []).map((image) => ({
          id: image.id,
          url: attachmentUrl(conversationId, image.id),
          fileName: image.fileName,
        })),
      });
    } else if (message.role === 'ASSISTANT') {
      if (message.content && message.content.trim()) {
        items.push({
          kind: 'message',
          id: `assistant-${items.length}`,
          role: 'assistant',
          text: message.content,
        });
      }
      for (const call of message.toolCalls ?? []) {
        const result = results.get(call.id);
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.arguments) as Record<string, unknown>;
        } catch {
          args = { raw: call.arguments };
        }
        let output: unknown = result?.content;
        let status: 'running' | 'succeeded' | 'failed' = 'running';
        if (result) {
          status = 'succeeded';
          try {
            const parsed = JSON.parse(result.content) as Record<string, unknown>;
            if (typeof parsed.error === 'string') {
              status = 'failed';
            }
            output = parsed;
          } catch {
            output = result.content;
          }
        }
        items.push({
          kind: 'tool',
          id: `tool-${call.id}`,
          toolCallId: call.id,
          toolName: call.name,
          args,
          status,
          output,
        });
      }
    }
  }
  for (const approval of stored.pendingApprovals ?? []) {
    if (approval.status !== 'pending') {
      continue;
    }
    let args: Record<string, unknown> = {};
    let validation: unknown = null;
    try {
      args = JSON.parse(approval.argsJson) as Record<string, unknown>;
    } catch {
      args = { raw: approval.argsJson };
    }
    try {
      validation = approval.validationJson ? JSON.parse(approval.validationJson) : null;
    } catch {
      validation = null;
    }
    items.push({
      kind: 'approval',
      id: `approval-${approval.approvalId}`,
      approvalId: approval.approvalId,
      toolCallId: approval.toolCallId,
      toolName: approval.toolName,
      target: approval.target,
      args,
      risk: approval.risk,
      reason: approval.reason,
      diff: approval.diff,
      validation,
      expiresAt: approval.expiresAt,
      status: 'pending',
    });
  }
  return items;
}
