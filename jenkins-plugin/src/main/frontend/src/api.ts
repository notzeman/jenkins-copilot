import type { ModelInfo, ServerEvent, SessionResponse, StoredConversation } from './types';

const root = document.getElementById('jenkins-ai-copilot-root');
if (!root) {
  throw new Error('Copilot root element missing');
}

export const runtime = {
  baseUrl: root.dataset.baseUrl ?? '/jenkins-ai-copilot/',
  context: safeJson(root.dataset.context ?? '{}') as Record<string, unknown>,
  maxSteps: Number(root.dataset.maxSteps ?? 20),
  version: root.dataset.pluginVersion ?? 'development',
};

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function crumbHeaders(): Record<string, string> {
  const head = document.head;
  const html = document.documentElement;
  const name = head.dataset.crumbHeader ?? html.dataset.crumbHeader;
  const value = head.dataset.crumbValue ?? html.dataset.crumbValue;
  return name && value ? { [name]: value } : {};
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let payload: unknown = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }
  if (!response.ok) {
    const error = (payload as { error?: { message?: string } }).error;
    throw new Error(error?.message ?? `Request failed (${response.status})`);
  }
  return payload as T;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${runtime.baseUrl}${path}`, {
    headers: { accept: 'application/json' },
    credentials: 'same-origin',
  });
  return parseJson<T>(response);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${runtime.baseUrl}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...crumbHeaders() },
    body: JSON.stringify(body),
  });
  return parseJson<T>(response);
}

export function loadSession(): Promise<SessionResponse> {
  return getJson<SessionResponse>('session');
}

export interface SetupRequest {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface SetupResponse {
  ok: boolean;
  provider: string;
  defaultModel: string;
  models: ModelInfo[];
}

export function setupProvider(body: SetupRequest): Promise<SetupResponse> {
  return postJson<SetupResponse>('setup', body);
}

export async function listModels(body: {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
}): Promise<ModelInfo[]> {
  const payload = await postJson<{ models: ModelInfo[] }>('models', body);
  return payload.models ?? [];
}

export async function listConversations(): Promise<
  Array<{ id: string; title: string; status: string; updatedAt: number; provider: string; model: string }>
> {
  const payload = await getJson<{
    conversations: Array<{
      id: string;
      title: string;
      status: string;
      updatedAt: number;
      provider: string;
      model: string;
    }>;
  }>('conversations');
  return payload.conversations ?? [];
}

export function loadConversation(id: string): Promise<StoredConversation> {
  return getJson<StoredConversation>(`conversation?id=${encodeURIComponent(id)}`);
}

export function deleteConversation(id: string): Promise<{ deleted: boolean }> {
  return postJson<{ deleted: boolean }>('deleteConversation', { id });
}

export function attachmentUrl(conversationId: string, attachmentId: string): string {
  return `${runtime.baseUrl}attachment?conversationId=${encodeURIComponent(
    conversationId,
  )}&id=${encodeURIComponent(attachmentId)}`;
}

export interface ChatBody {
  conversationId?: string;
  message?: string;
  provider?: string;
  model?: string;
  thinking?: string;
  context?: Record<string, unknown>;
  attachments?: Array<{ mediaType: string; fileName: string; dataBase64: string }>;
}

export interface DecisionBody {
  conversationId: string;
  context?: Record<string, unknown>;
  approvalId: string;
  approved: boolean;
  comment?: string;
}

export function streamChat(
  body: ChatBody,
  onEvent: (event: ServerEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  return stream('chat', body, onEvent, signal);
}

export function streamDecision(
  body: DecisionBody,
  onEvent: (event: ServerEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  return stream('decision', body, onEvent, signal);
}

async function stream(
  path: string,
  body: unknown,
  onEvent: (event: ServerEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch(`${runtime.baseUrl}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      accept: 'text/event-stream',
      ...crumbHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed (${response.status})`;
    try {
      const payload = JSON.parse(text) as { error?: { message?: string } };
      message = payload.error?.message ?? message;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
  if (!response.body) {
    throw new Error('Streaming is not supported by this browser');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
    let boundary = buffer.indexOf('\n\n');
    while (boundary >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const parsed = parseBlock(block);
      if (parsed) {
        onEvent(parsed);
      }
      boundary = buffer.indexOf('\n\n');
    }
  }
}

function parseBlock(block: string): ServerEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }
  if (dataLines.length === 0) {
    return null;
  }
  try {
    return { event, data: JSON.parse(dataLines.join('\n')) } as ServerEvent;
  } catch {
    return null;
  }
}
