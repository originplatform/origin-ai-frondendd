export type TaskStatus =
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'awaiting_approval'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  llm_provider: string;
  notification_preferences: {
    email_on_approval: boolean;
    email_on_completion: boolean;
    live_toasts: boolean;
  };
  created_at: string;
}

export interface UserSession {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface PlanStep {
  step_id: string;
  index: number;
  title: string;
  description: string;
  agent_name: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  depends_on: string[];
  requires_approval: boolean;
  status: StepStatus;
  result_summary?: string | null;
  error?: string | null;
  duration_ms?: number | null;
}

export interface AgentExecution {
  id: string;
  agent_name: string;
  step_id: string | null;
  status: string;
  summary: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
}

export interface ToolExecution {
  id: string;
  step_id: string | null;
  tool_name: string;
  status: string;
  arguments_preview: Record<string, unknown>;
  output_preview: Record<string, unknown> | null;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface Approval {
  id: string;
  task_id: string;
  step_id: string;
  action_type: string;
  service_name: string;
  title: string;
  description: string;
  action_details: Record<string, unknown>;
  action_hash: string;
  status: ApprovalStatus;
  decision_note: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface GeneratedFile {
  id: string;
  task_id: string | null;
  filename: string;
  content_type: string;
  size_bytes: number;
  file_kind: 'generated' | 'uploaded' | 'chart' | 'artifact';
  created_at: string;
  download_url: string;
}

export interface Task {
  id: string;
  user_id: string;
  command: string;
  intent: string | null;
  status: TaskStatus;
  execution_plan: PlanStep[];
  final_response: string | null;
  error_message: string | null;
  duration_ms: number | null;
  token_usage: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  agent_executions: AgentExecution[];
  tool_executions: ToolExecution[];
  approvals: Approval[];
  files: GeneratedFile[];
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskEvent {
  event_type: string;
  task_id: string;
  timestamp: string;
  agent_name?: string | null;
  step_id?: string | null;
  message: string;
  payload?: Record<string, unknown>;
}

export interface AgentMetadata {
  id: string;
  name: string;
  category: 'orchestration' | 'functional';
  description: string;
  capabilities: string[];
  permissions: string[];
  requires_approval: boolean;
  status: 'active' | 'sandboxed' | 'demo_ready';
}

export interface ConnectedService {
  id: string;
  service_key: string;
  display_name: string;
  category: string;
  description: string;
  status: 'connected' | 'demo_mode' | 'disconnected';
  account_label: string | null;
  config_summary: Record<string, string>;
  setup_instructions: string;
  supports_oauth: boolean;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  severity: 'info' | 'warning' | 'security';
  details: Record<string, unknown>;
  created_at: string;
}
