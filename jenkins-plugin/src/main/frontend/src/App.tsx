import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  attachmentUrl,
  createConversation,
  deleteConversation,
  fetchProviderModels,
  getAccounts,
  listConversations,
  loadConversation,
  loadSession,
  renameConversation,
  runtime,
  setApprovalMode,
  streamChat,
  streamDecision,
} from './api';
import { prepareAttachment, type LocalAttachment } from './attachments';
import type {
  AccountsResponse,
  Item,
  ModelInfo,
  ServerEvent,
  SessionResponse,
  SessionSummary,
  StoredConversation,
} from './types';
import { Markdown } from './components/Markdown';
import { ToolCard } from './components/ToolCard';
import { ApprovalCard } from './components/ApprovalCard';
import { ApprovalDock } from './components/ApprovalDock';
import { ReasoningPanel } from './components/ReasoningPanel';
import { CopyButton } from './components/CopyButton';
import { SettingsPage } from './components/SettingsPage';
import { SessionList } from './components/SessionList';
import {
  ModelPicker,
  ProviderPicker,
  ThinkingPicker,
  type ModelsState,
} from './components/Pickers';
import { ThinkingLine } from './components/ThinkingLine';
import { TipLayer } from './components/TipLayer';
import {
  AlertIcon,
  BowTie,
  ChevronIcon,
  ContractIcon,
  ExpandIcon,
  GearIcon,
  GitHubIcon,
  MoonIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  ShieldIcon,
  ShieldWarningIcon,
  StatusIcon,
  StopIcon,
  SunIcon,
  XIcon,
  buildState,
} from './components/icons';
import { accentVars, loadAccent, saveAccent } from './accent';

type ApprovalItem = Extract<Item, { kind: 'approval' }>;
type View = 'chat' | 'sessions' | 'settings';

function storedModelsError(error: unknown): { error: string } {
  return { error: error instanceof Error ? error.message : 'Could not load models' };
}

export function App(): React.ReactElement {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem('cp.width'));
    return Number.isFinite(saved) && saved >= 360 && saved <= 760 ? saved : 440;
  });
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [items, setItems] = useState<Item[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [accounts, setAccounts] = useState<AccountsResponse | null>(null);
  const [providerAccountId, setProviderAccountId] = useState(
    () => localStorage.getItem('cp.account') ?? '',
  );
  const [model, setModel] = useState(() => localStorage.getItem('cp.model') ?? '');
  const [modelsState, setModelsState] = useState<ModelsState>({});
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'thinking' | 'tools' | 'streaming' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalBusy, setApprovalBusy] = useState(false);
  const [thinking, setThinking] = useState(() => localStorage.getItem('cp.thinking') ?? 'AUTO');
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cp.theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });
  const [accent, setAccent] = useState(loadAccent);

  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamingId = useRef<string | null>(null);
  const modelsRef = useRef<ModelsState>({});
  const loadingModels = useRef<Set<string>>(new Set());
  const openedSettings = useRef(false);
  modelsRef.current = modelsState;

  const refreshSessions = useCallback(async () => {
    try {
      setSessions(await listConversations());
    } catch {
      // Conversation history is non-critical; keep the current list.
    }
  }, []);

  const loadModels = useCallback(async (accountId: string, force = false) => {
    if (!accountId || loadingModels.current.has(accountId)) {
      return;
    }
    const current = modelsRef.current[accountId];
    if (!force && Array.isArray(current)) {
      return;
    }
    loadingModels.current.add(accountId);
    setModelsState((value) => ({ ...value, [accountId]: 'loading' }));
    try {
      const result = await fetchProviderModels({ id: accountId });
      setModelsState((value) => ({ ...value, [accountId]: result.models }));
    } catch (loadError) {
      setModelsState((value) => ({ ...value, [accountId]: storedModelsError(loadError) }));
    } finally {
      loadingModels.current.delete(accountId);
    }
  }, []);

  const reloadAccounts = useCallback(async () => {
    try {
      const next = await getAccounts();
      setAccounts(next);
      const loaded = await loadSession();
      setSession(loaded);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : 'Could not reload settings');
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await loadSession();
        setSession(loaded);
        if (!loaded.authenticated) {
          return;
        }
        try {
          const accountResult = await getAccounts();
          setAccounts(accountResult);
          const preferred =
            accountResult.providers.find((item) => item.id === accountResult.defaultProviderId) ??
            accountResult.providers[0];
          if (preferred) {
            setProviderAccountId((current) => current || preferred.id);
            setModel((current) => current || preferred.defaultModel || '');
          }
        } catch {
          // Older controllers or restricted users may not expose the account store yet.
        }
        await refreshSessions();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the assistant');
      }
    })();
  }, [refreshSessions]);

  useEffect(() => {
    if (!accounts || accounts.providers.length === 0) {
      return;
    }
    setProviderAccountId((current) => {
      if (current && accounts.providers.some((item) => item.id === current)) {
        return current;
      }
      const preferred =
        accounts.providers.find((item) => item.id === accounts.defaultProviderId) ??
        accounts.providers[0];
      return preferred.id;
    });
  }, [accounts]);

  useEffect(() => {
    if (!providerAccountId) {
      return;
    }
    const account = accounts?.providers.find((item) => item.id === providerAccountId);
    setModel((current) => current || account?.defaultModel || '');
    void loadModels(providerAccountId);
  }, [accounts, loadModels, providerAccountId]);

  useEffect(() => {
    if (!providerAccountId || model) {
      return;
    }
    const list = modelsState[providerAccountId];
    if (Array.isArray(list) && list[0]) {
      setModel(list[0].id);
    }
  }, [model, modelsState, providerAccountId]);

  useEffect(() => {
    localStorage.setItem('cp.account', providerAccountId);
  }, [providerAccountId]);

  useEffect(() => {
    localStorage.setItem('cp.model', model);
  }, [model]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape' && open) {
        const shadow = document.getElementById('jenkins-ai-copilot-root')?.shadowRoot;
        if (shadow?.querySelector('.cp-menu')) {
          return;
        }
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
  }, [open, view]);

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

  const context = useMemo<Record<string, unknown>>(
    () => ({
      ...(runtime.context as Record<string, unknown>),
      ...((session?.context ?? {}) as Record<string, unknown>),
    }),
    [session],
  );

  const jobName = typeof context.jobFullName === 'string' ? context.jobFullName : undefined;
  const buildNumber = typeof context.buildNumber === 'number' ? context.buildNumber : undefined;
  const pipelineKey =
    typeof context.pipeline === 'string' && context.pipeline
      ? context.pipeline
      : jobName ?? 'General';
  const buildResult = typeof context.buildResult === 'string' ? context.buildResult : null;
  const lastBuildResult =
    typeof context.lastBuildResult === 'string' ? context.lastBuildResult : buildResult;
  const lastBuildNumber =
    typeof context.lastBuildNumber === 'number' ? context.lastBuildNumber : buildNumber;
  const broken = lastBuildResult === 'FAILURE' || lastBuildResult === 'UNSTABLE';
  const setupRequired = accounts
    ? accounts.providers.length === 0
    : session?.config.setupRequired ?? true;
  const currentSession = sessions.find((item) => item.id === conversationId);
  const approvalsBypassed = session?.config.autoApproveAll === true;
  const pendingApprovals = items.filter(
    (item): item is ApprovalItem => item.kind === 'approval' && item.status === 'pending',
  );

  useEffect(() => {
    if (session?.isAdmin && setupRequired && !openedSettings.current) {
      openedSettings.current = true;
      setView('settings');
    }
  }, [session?.isAdmin, setupRequired]);

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

  const finishReasoning = useCallback(() => {
    setItems((current) =>
      current.map((item) =>
        item.kind === 'reasoning' && !item.done ? { ...item, done: true } : item,
      ),
    );
  }, []);

  const handleEvent = useCallback(
    (event: ServerEvent) => {
      switch (event.event) {
        case 'conversation':
          setConversationId(event.data.id);
          break;
        case 'message.reasoning':
          setPhase('thinking');
          setItems((current) => {
            const last = current[current.length - 1];
            if (last && last.kind === 'reasoning' && !last.done) {
              return [
                ...current.slice(0, -1),
                { ...last, text: last.text + event.data.text },
              ];
            }
            return [
              ...current,
              {
                kind: 'reasoning',
                id: `reasoning-${Date.now()}`,
                text: event.data.text,
                done: false,
              },
            ];
          });
          break;
        case 'message.delta': {
          setPhase('streaming');
          finishReasoning();
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
          finishReasoning();
          const existing = streamingId.current;
          streamingId.current = null;
          setPhase(null);
          if (existing) {
            setItems((current) =>
              current.map((item) =>
                item.kind === 'message' && item.id === existing
                  ? { ...item, text: item.text || event.data.text, streaming: false }
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
        case 'tool.start': {
          setPhase('tools');
          finishReasoning();
          const streamingMessage = streamingId.current;
          streamingId.current = null;
          if (streamingMessage) {
            setItems((current) =>
              current.map((item) =>
                item.kind === 'message' && item.id === streamingMessage
                  ? { ...item, streaming: false, narration: true }
                  : item,
              ),
            );
          }
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
        }
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
          finishReasoning();
          setBusy(false);
          setPhase(null);
          void refreshSessions();
          break;
        default:
          break;
      }
    },
    [addItem, finishReasoning, refreshSessions, updateTool],
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
    async (text: string, options?: { conversationId?: string }) => {
      const message = text.trim();
      if (busy || (!message && attachments.length === 0)) {
        return;
      }
      if (!session) {
        return;
      }
      if (setupRequired) {
        if (session.isAdmin) {
          setView('settings');
        }
        return;
      }
      if (!providerAccountId) {
        setError('Choose a provider account first');
        return;
      }
      if (!model) {
        setError('Choose a model first');
        return;
      }
      const targetId = options?.conversationId ?? conversationId;
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
            ...(targetId ? { conversationId: targetId } : { pipeline: pipelineKey }),
            message,
            providerAccountId,
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
    [
      addItem,
      attachments,
      busy,
      context,
      conversationId,
      handleEvent,
      model,
      pipelineKey,
      providerAccountId,
      session,
      setupRequired,
      thinking,
    ],
  );

  const newSession = useCallback(
    async (pipeline?: string) => {
      abortRef.current?.abort();
      setBusy(false);
      try {
        const created = await createConversation(pipeline || pipelineKey || 'General', {
          providerAccountId,
          model,
          thinking,
        });
        streamingId.current = null;
        setConversationId(created.id);
        setItems([]);
        setError(null);
        setInput('');
        setAttachments([]);
        setPhase(null);
        if (created.providerAccountId) {
          setProviderAccountId(created.providerAccountId);
        }
        if (created.model) {
          setModel(created.model);
        }
        setView('chat');
        await refreshSessions();
        window.setTimeout(() => textareaRef.current?.focus(), 60);
      } catch (createError) {
        setError(createError instanceof Error ? createError.message : 'Could not create a session');
      }
    },
    [model, pipelineKey, providerAccountId, refreshSessions, thinking],
  );

  const quickAnalyse = useCallback(async () => {
    if (busy || !jobName) {
      return;
    }
    try {
      const pipeline = pipelineKey || jobName;
      const created = await createConversation(pipeline, { providerAccountId, model, thinking });
      streamingId.current = null;
      setConversationId(created.id);
      setItems([]);
      setAttachments([]);
      setView('chat');
      await refreshSessions();
      const where = lastBuildNumber ? ` #${lastBuildNumber}` : ' latest build';
      await send(
        `Investigate the failing${where} of ${jobName}. Pull the console log and recent changes, identify the ` +
          `failing stage and root cause, then propose the smallest safe fix. Do not change anything without approval.`,
        { conversationId: created.id },
      );
    } catch (analyseError) {
      setError(analyseError instanceof Error ? analyseError.message : 'Could not start the analysis');
    }
  }, [busy, jobName, lastBuildNumber, model, pipelineKey, providerAccountId, refreshSessions, send, thinking]);

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
    [addItem, busy, context, conversationId, handleEvent],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    finishReasoning();
    setBusy(false);
    setPhase(null);
    setItems((current) =>
      current.map((item) =>
        item.kind === 'message' && item.streaming ? { ...item, streaming: false } : item,
      ),
    );
  }, [finishReasoning]);

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

  const selectSession = useCallback(
    async (id: string) => {
      if (!id) {
        reset();
        setView('chat');
        return;
      }
      abortRef.current?.abort();
      streamingId.current = null;
      setBusy(false);
      try {
        const stored: StoredConversation = await loadConversation(id);
        setItems(mapStoredConversation(stored, id));
        setConversationId(id);
        setThinking(stored.conversation.thinking || 'AUTO');
        setModel(stored.conversation.model || '');
        if (stored.conversation.providerAccountId) {
          setProviderAccountId(stored.conversation.providerAccountId);
          void loadModels(stored.conversation.providerAccountId);
        }
        setError(null);
        setView('chat');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the conversation');
      }
    },
    [loadModels, reset],
  );

  const renameSession = useCallback(
    async (id: string, title: string) => {
      try {
        await renameConversation(id, title);
        await refreshSessions();
      } catch (renameError) {
        setError(renameError instanceof Error ? renameError.message : 'Could not rename the session');
      }
    },
    [refreshSessions],
  );

  const removeSession = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        if (id === conversationId) {
          reset();
        }
        await refreshSessions();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the session');
      }
    },
    [conversationId, refreshSessions, reset],
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

  const toggleApprovalBypass = useCallback(async () => {
    if (!session?.isAdmin || approvalBusy) {
      return;
    }
    setApprovalBusy(true);
    try {
      const result = await setApprovalMode(approvalsBypassed ? 'ask' : 'bypass');
      setSession((current) =>
        current
          ? {
              ...current,
              config: {
                ...current.config,
                autoApproveLevel2: result.autoApproveLevel2,
                autoApproveAll: result.autoApproveAll,
              },
            }
          : current,
      );
      setError(null);
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'Could not change the approval mode',
      );
    } finally {
      setApprovalBusy(false);
    }
  }, [approvalBusy, approvalsBypassed, session?.isAdmin]);

  const changeTheme = useCallback((next: 'light' | 'dark') => {
    setTheme(next);
    localStorage.setItem('cp.theme', next);
  }, []);

  const changeAccent = useCallback((next: string) => {
    setAccent(next);
    saveAccent(next);
  }, []);

  const changeThinking = useCallback((next: string) => {
    setThinking(next);
    localStorage.setItem('cp.thinking', next);
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

  const lastItem = items[items.length - 1];
  const runningTool = [...items]
    .reverse()
    .find((item): item is Extract<Item, { kind: 'tool' }> => item.kind === 'tool' && item.status === 'running');
  const reasoningLive = lastItem?.kind === 'reasoning' && !lastItem.done;
  const showWorking = busy && phase !== 'streaming' && !reasoningLive;
  const shellStyle = useMemo(() => accentVars(accent, theme), [accent, theme]);

  const placeholder = busy
    ? 'Copilot is working…'
    : setupRequired
      ? 'Finish provider setup first…'
      : jobName
        ? `Ask about ${jobName}…`
        : 'Ask about a job, build, pipeline, or deployment…';

  return (
    <div className="cp-shell" data-theme={theme} style={shellStyle}>
      {!open && (
        <button
          type="button"
          className={`cp-fab ${broken ? 'cp-fab-alert' : ''}`}
          aria-label={broken ? 'Open Jenkins Copilot — latest build failed' : 'Open Jenkins Copilot'}
          data-tip={
            broken
              ? `Latest build ${lastBuildResult ?? 'failed'}. Open Copilot`
              : 'Jenkins Copilot (Ctrl+J)'
          }
          onClick={() => setOpen(true)}
        >
          <BowTie />
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

        {view === 'settings' && session ? (
          <SettingsPage
            accounts={accounts}
            isAdmin={session.isAdmin}
            version={runtime.version}
            theme={theme}
            onThemeChange={changeTheme}
            accent={accent}
            onAccentChange={changeAccent}
            onClose={() => setView('chat')}
            onReload={reloadAccounts}
            onAccountsChanged={setAccounts}
          />
        ) : view === 'sessions' ? (
          <SessionList
            sessions={sessions}
            activeId={conversationId}
            currentPipeline={pipelineKey}
            collapsed={collapsed}
            onToggle={(pipeline) =>
              setCollapsed((current) => {
                const next = new Set(current);
                if (next.has(pipeline)) {
                  next.delete(pipeline);
                } else {
                  next.add(pipeline);
                }
                return next;
              })
            }
            onSelect={(id) => void selectSession(id)}
            onNew={(pipeline) => void newSession(pipeline)}
            onDelete={(id) => void removeSession(id)}
            onRename={(id, title) => void renameSession(id, title)}
            onClose={() => setView('chat')}
          />
        ) : (
          <>
            <header className="cp-head">
              <div className="cp-head-row">
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip="Sessions"
                  aria-label="Back to sessions"
                  onClick={() => setView('sessions')}
                >
                  <ChevronIcon className="cp-back-chevron" />
                </button>
                <div className={`cp-logo ${broken ? 'cp-logo-alert' : ''}`}>
                  <BowTie className={busy ? 'cp-tie-busy' : ''} />
                </div>
                <div className="cp-head-text">
                  <div className="cp-title">Copilot</div>
                </div>
                <div className="cp-grow" />
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip="New session"
                  aria-label="New session"
                  onClick={() => void newSession(pipelineKey)}
                >
                  <PlusIcon />
                </button>
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip="Settings"
                  aria-label="Settings"
                  onClick={() => setView('settings')}
                >
                  <GearIcon />
                </button>
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  aria-label="Toggle theme"
                  onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip={expanded ? 'Restore width' : 'Expand'}
                  aria-label="Expand assistant"
                  aria-pressed={expanded}
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? <ContractIcon /> : <ExpandIcon />}
                </button>
                <button
                  type="button"
                  className="cp-iconbtn"
                  data-tip="Close (Ctrl+J)"
                  aria-label="Close assistant"
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                </button>
              </div>

              <div className="cp-context">
                {lastBuildNumber !== undefined && (
                  <StatusIcon
                    state={buildState(lastBuildResult)}
                    label={`Build #${lastBuildNumber}: ${lastBuildResult ?? 'in progress'}`}
                  />
                )}
                <span className="cp-context-job" data-tip={jobName} data-tip-truncated>
                  {jobName ?? 'All of Jenkins'}
                </span>
                {lastBuildNumber !== undefined && <span className="cp-context-build">#{lastBuildNumber}</span>}
                {currentSession && (
                  <span className="cp-context-session" data-tip={currentSession.title} data-tip-truncated>
                    {currentSession.title}
                  </span>
                )}
                <span className="cp-context-flags">
                  {setupRequired && (
                    <span className="cp-flag cp-flag-danger" role="img" tabIndex={0} aria-label="Setup required" data-tip="Setup required: add a provider">
                      <AlertIcon />
                    </span>
                  )}
                  {approvalsBypassed && (
                    <span className="cp-flag cp-flag-danger" role="img" tabIndex={0} aria-label="Approvals are bypassed" data-tip="Approvals are bypassed">
                      <ShieldWarningIcon />
                    </span>
                  )}
                  {session && !session.config.githubConfigured && (
                    <span className="cp-flag" role="img" tabIndex={0} aria-label="GitHub is not configured" data-tip="GitHub is not configured">
                      <GitHubIcon />
                    </span>
                  )}
                </span>
              </div>
            </header>

            {error && <div className="cp-banner">{error}</div>}

            <div className="cp-thread" ref={threadRef}>
              {items.length === 0 && (
                <div className="cp-empty">
                  {broken && (
                    <div className="cp-alert">
                      <div className="cp-alert-title">
                        <StatusIcon
                          state={buildState(lastBuildResult)}
                          label={`Latest build: ${lastBuildResult ?? 'failed'}`}
                        />
                        {`Build ${lastBuildNumber ? `#${lastBuildNumber} ` : ''}${
                          lastBuildResult === 'UNSTABLE' ? 'is unstable' : 'failed'
                        }`}
                      </div>
                      <p>
                        {jobName ?? 'This pipeline'} did not finish cleanly. I can read the console log,
                        compare recent changes, and point at the failing stage before proposing a fix.
                      </p>
                      <div className="cp-alert-actions">
                        <button
                          type="button"
                          className="cp-btn cp-primary"
                          onClick={() => void quickAnalyse()}
                          disabled={busy || !jobName}
                        >
                          Quickly analyse
                        </button>
                        <button
                          type="button"
                          className="cp-btn"
                          onClick={() =>
                            void send(`Show me the console log of the latest build of ${jobName ?? 'this job'}.`)
                          }
                          disabled={busy}
                        >
                          Show log
                        </button>
                      </div>
                    </div>
                  )}

                  {setupRequired ? (
                    <>
                      <h3>Finish setup</h3>
                      <p>
                        An administrator needs to add a provider account before the assistant can answer
                        questions.
                      </p>
                      {session?.isAdmin && (
                        <button
                          type="button"
                          className="cp-btn cp-primary"
                          onClick={() => setView('settings')}
                        >
                          Open settings
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <h3>{broken ? 'Let’s get this build green' : 'What are we fixing?'}</h3>
                      <p>
                        I can inspect jobs and builds, diagnose failures, generate and review Jenkinsfiles,
                        and prepare approved pipeline or deployment recovery changes.
                      </p>
                      {currentSession && (
                        <p className="cp-empty-session">
                          Continuing <b>{currentSession.title}</b> ·{' '}
                          {currentSession.messageCount} message
                          {currentSession.messageCount === 1 ? '' : 's'}
                        </p>
                      )}
                      <div className="cp-quick">
                        {quickActions.map((action) => (
                          <button key={action} type="button" onClick={() => void send(action)}>
                            {action}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {items.map((item) => {
                if (item.kind === 'reasoning') {
                  return <ReasoningPanel item={item} key={item.id} />;
                }
                if (item.kind === 'message') {
                  return (
                    <div
                      className={`cp-msg ${item.role === 'user' ? 'cp-user' : ''} ${
                        item.role === 'assistant' && item.narration ? 'cp-narration-msg' : ''
                      }`}
                      key={item.id}
                    >
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
                      ) : item.streaming || item.narration ? (
                        <>
                          <div
                            className={`cp-msg-body ${item.narration ? 'cp-narration' : ''}`}
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {item.text}
                            {item.streaming && <span className="cp-cursor" role="img" aria-label="Streaming" />}
                          </div>
                        </>
                      ) : (
                        <Markdown text={item.text} />
                      )}
                      {item.role === 'assistant' && !item.streaming && !item.narration && (
                        <div className="cp-msg-foot">
                          <CopyButton text={item.text} label="Copy response" />
                        </div>
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
              {showWorking && <ThinkingLine toolName={runningTool?.toolName} />}
            </div>

            <ApprovalDock approvals={pendingApprovals} onDecide={decide} />

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
                  placeholder={placeholder}
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
                      data-tip="Attach image"
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
                      className="cp-shield-wrap"
                      data-tip={
                        !session?.isAdmin
                          ? 'Only administrators can bypass approvals'
                          : approvalsBypassed
                            ? 'Approvals are bypassed. Click to require approval again'
                            : 'Privileged actions need your approval. Click to bypass all approvals'
                      }
                    >
                      <button
                        type="button"
                        className={`cp-shield ${approvalsBypassed ? 'cp-shield-bypass' : ''}`}
                        aria-label={approvalsBypassed ? 'Restore human approval' : 'Bypass approvals'}
                        aria-pressed={approvalsBypassed}
                        disabled={!session?.isAdmin || approvalBusy}
                        onClick={() => void toggleApprovalBypass()}
                      >
                        {approvalsBypassed ? <ShieldWarningIcon /> : <ShieldIcon />}
                      </button>
                    </span>
                  </div>

                  <div className="cp-bar-right">
                    {accounts && accounts.providers.length > 0 && (
                      <ProviderPicker
                        accounts={accounts.providers}
                        value={providerAccountId}
                        onSelect={(account) => {
                          setProviderAccountId(account.id);
                          setModel(account.defaultModel || '');
                          void loadModels(account.id);
                        }}
                      />
                    )}

                    <ModelPicker
                      accounts={accounts?.providers ?? []}
                      accountId={providerAccountId}
                      model={model}
                      models={modelsState}
                      onOpen={(accountId) => void loadModels(accountId)}
                      onSelect={(accountId, nextModel) => {
                        setProviderAccountId(accountId);
                        setModel(nextModel);
                      }}
                      onRefresh={() => void loadModels(providerAccountId, true)}
                    />

                    <ThinkingPicker value={thinking} onChange={changeThinking} />

                    {busy ? (
                      <button type="button" className="cp-send" onClick={stop} aria-label="Stop" data-tip="Stop">
                        <StopIcon />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="cp-send"
                        onClick={() => void send(input)}
                        disabled={!input.trim() && attachments.length === 0}
                        aria-label="Send"
                        data-tip="Send (Enter)"
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
      <div id="cp-portal" className="cp-portal-root" />
      <TipLayer />
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
