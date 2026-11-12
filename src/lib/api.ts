import type {
  AgentMetadata,
  Approval,
  AuditLogEntry,
  ConnectedService,
  GeneratedFile,
  Task,
  TaskEvent,
  TaskListResponse,
  User,
  UserSession,
} from '../types/api';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    try {
      const payload = await response.json();
      message = payload.detail || payload.message || message;
      code = payload.code;
    } catch {
      // ignore non-json error response
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: { email: string; full_name: string; password: string }) =>
      request<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
    me: () => request<User>('/auth/me'),
    updateProfile: (data: {
      full_name?: string;
      llm_provider?: string;
      notification_preferences?: User['notification_preferences'];
    }) =>
      request<User>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    changePassword: (data: { current_password: string; new_password: string }) =>
      request<{ ok: boolean }>('/auth/password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sessions: () => request<UserSession[]>('/auth/sessions'),
    revokeSession: (sessionId: string) =>
      request<{ ok: boolean }>(`/auth/sessions/${sessionId}`, { method: 'DELETE' }),
    auditLogs: () => request<AuditLogEntry[]>('/auth/audit-logs'),
  },

  tasks: {
    create: (data: { command: string; attached_file_ids?: string[] }) =>
      request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (params?: { search?: string; status?: string; page?: number; page_size?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.status && params.status !== 'all') query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.page_size) query.set('page_size', String(params.page_size));
      const qs = query.toString();
      return request<TaskListResponse>(`/tasks${qs ? `?${qs}` : ''}`);
    },
    get: (taskId: string) => request<Task>(`/tasks/${taskId}`),
    retry: (taskId: string) => request<Task>(`/tasks/${taskId}/retry`, { method: 'POST' }),
    subscribeEvents: (
      taskId: string,
      onEvent: (ev: TaskEvent) => void,
      onError?: (err: unknown) => void
    ): (() => void) => {
      const source = new EventSource(`${API_BASE}/tasks/${taskId}/events`, {
        withCredentials: true,
      });

      const handleMsg = (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data) as TaskEvent;
          onEvent(parsed);
        } catch {
          // ignore malformed keepalive
        }
      };

      source.onmessage = handleMsg;
      const eventTypes = [
        'task_started',
        'agent_update',
        'plan_created',
        'step_started',
        'step_completed',
        'step_failed',
        'approval_required',
        'approval_resolved',
        'task_completed',
        'task_failed',
      ];
      eventTypes.forEach((evt) => source.addEventListener(evt, handleMsg));

      source.onerror = (err) => {
        if (onError) onError(err);
      };

      return () => {
        source.close();
      };
    },
  },

  approvals: {
    list: (status?: string) => {
      const qs = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
      return request<Approval[]>(`/approvals${qs}`);
    },
    decide: (approvalId: string, data: { decision: 'approve' | 'reject'; note?: string }) =>
      request<Approval>(`/approvals/${approvalId}/decision`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  files: {
    upload: async (file: File): Promise<GeneratedFile> => {
      const formData = new FormData();
      formData.append('file', file);
      return request<GeneratedFile>('/files/upload', {
        method: 'POST',
        body: formData,
      });
    },
    list: () => request<GeneratedFile[]>('/files'),
    downloadUrl: (fileId: string) => `${API_BASE}/files/${fileId}/download`,
  },

  agents: {
    list: () => request<AgentMetadata[]>('/agents'),
  },

  services: {
    list: () => request<ConnectedService[]>('/services'),
    configure: (
      serviceKey: string,
      data: {
        account_label?: string;
        credentials?: Record<string, string>;
        config?: Record<string, string>;
        mode?: 'connected' | 'demo_mode' | 'disconnected';
      }
    ) =>
      request<ConnectedService>(`/services/${serviceKey}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  health: () => request<{ status: string; version: string; database: string; redis: string }>('/health'),
};
