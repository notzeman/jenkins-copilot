export interface SessionContext {
  jenkinsUrl?: string;
  jobFullName?: string;
  jobUrl?: string;
  jobType?: string;
  buildNumber?: number;
  buildUrl?: string;
  buildResult?: string | null;
  pipeline?: string;
  lastBuildNumber?: number;
  lastBuildResult?: string | null;
  lastBuildUrl?: string;
  jobHealthScore?: number;
}

export interface ProviderInfo {
  id: string;
  label: string;
  configured: boolean;
  baseUrl?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: string | null;
  isAdmin: boolean;
  context: SessionContext;
  config: {
    enabled: boolean;
    sidebarEnabled: boolean;
    setupRequired: boolean;
    defaultProvider: string;
    defaultModel: string;
    maxSteps: number;
    maxAttachmentMb: number;
    autoApproveLevel2: boolean;
    autoApproveAll?: boolean;
    githubConfigured: boolean;
    accountsConfigured?: boolean;
    defaultProviderId?: string;
    providers: ProviderInfo[];
  };
}

export interface ProviderAccount {
  id: string;
  provider: string;
  providerLabel: string;
  label: string;
  baseUrl: string;
  defaultModel: string;
  hasKey: boolean;
  default: boolean;
}

export interface GitHubAccount {
  id: string;
  label: string;
  apiUrl: string;
  hasToken: boolean;
  default: boolean;
}

export interface AccountsResponse {
  providers: ProviderAccount[];
  github: GitHubAccount[];
  defaultProviderId: string;
  defaultGithubId: string;
}

export interface SessionCreated {
  id: string;
  title?: string;
  provider?: string;
  providerAccountId?: string;
  model?: string;
  thinking?: string;
  pipeline?: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  status: string;
  updatedAt: number;
  createdAt: number;
  provider: string;
  model: string;
  pipeline: string;
  providerAccountId: string;
  messageCount: number;
}

export interface ModelInfo {
  id: string;
  label: string;
}

export interface AttachmentRef {
  id: string;
  mediaType: string;
  fileName: string;
  size: number;
}

export interface PendingAttachment {
  mediaType: string;
  fileName: string;
  dataBase64: string;
  previewUrl: string;
  size: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

export interface StoredMessage {
  role: 'SYSTEM' | 'USER' | 'ASSISTANT' | 'TOOL';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
  images?: AttachmentRef[];
}

export interface ApprovalRecord {
  approvalId: string;
  toolCallId: string;
  toolName: string;
  target: string | null;
  argsJson: string;
  risk: number;
  reason: string;
  diff: string | null;
  validationJson: string | null;
  expiresAt: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  comment?: string | null;
}

export interface StoredConversation {
  conversation: {
    id: string;
    title: string;
    provider: string;
    model: string;
    thinking: string;
    updatedAt: number;
    pipeline?: string;
    providerAccountId?: string;
    status?: string;
  };
  messages: StoredMessage[];
  pendingApprovals: ApprovalRecord[];
}

export type Item =
  | {
      kind: 'reasoning';
      id: string;
      text: string;
      done: boolean;
    }
  | {
      kind: 'message';
      id: string;
      role: 'user' | 'assistant';
      text: string;
      streaming?: boolean;
      /** Text that introduced tool calls; rendered as plain analysis, not Markdown. */
      narration?: boolean;
      images?: Array<{ id?: string; url: string; fileName?: string }>;
    }
  | {
      kind: 'tool';
      id: string;
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      status: 'running' | 'succeeded' | 'failed' | 'denied';
      output?: unknown;
      error?: string;
      risk?: number;
      reason?: string;
    }
  | {
      kind: 'approval';
      id: string;
      approvalId: string;
      toolCallId: string;
      toolName: string;
      target: string | null;
      args: Record<string, unknown>;
      risk: number;
      reason: string;
      diff: string | null;
      validation: unknown;
      expiresAt: number;
      status: 'pending' | 'approved' | 'rejected';
    }
  | { kind: 'error'; id: string; text: string };

export type ServerEvent =
  | { event: 'conversation'; data: { id: string; title: string } }
  | { event: 'message.delta'; data: { text: string } }
  | { event: 'message.reasoning'; data: { text: string } }
  | { event: 'message.completed'; data: { text: string; status: string } }
  | {
      event: 'tool.start';
      data: {
        toolCallId: string;
        toolName: string;
        args: Record<string, unknown>;
        risk: number;
        reason: string;
      };
    }
  | {
      event: 'tool.result';
      data: { toolCallId: string; toolName: string; summary: string; output: unknown };
    }
  | { event: 'tool.error'; data: { toolCallId: string; toolName: string; error: string } }
  | {
      event: 'approval.required';
      data: {
        approvalId: string;
        toolCallId: string;
        toolName: string;
        target: string | null;
        args: Record<string, unknown>;
        risk: number;
        reason: string;
        diff: string | null;
        validation: unknown;
        expiresAt: number;
      };
    }
  | { event: 'error'; data: { message: string; retryable?: boolean } }
  | { event: 'done'; data: { status: string; approvals?: number } };

export interface Skill {
  id: string;
  slug: string;
  name: string;
  kind: string;
  description: string;
  whenToUse: string;
  body: string;
  tags: string[];
  sourceJobs: string[];
  enabled: boolean;
  version: number;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SkillsResponse {
  skills: Skill[];
  count: number;
}

export interface SkillInput {
  id?: string;
  name: string;
  slug?: string;
  kind?: string;
  description?: string;
  whenToUse?: string;
  body: string;
  tags?: string[];
  sourceJobs?: string[];
  enabled?: boolean;
}
