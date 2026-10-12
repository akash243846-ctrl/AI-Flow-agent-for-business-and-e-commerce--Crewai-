export interface AgentEvent {
  id: number;
  task_id: string;
  agent_name: string;
  event_type: string;
  message: string;
  timestamp: string;
}

export interface Task {
  id: string;
  query: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "AWAITING_APPROVAL";
  created_at: string;
  completed_at?: string;
  elapsed_seconds?: number;
  csv_filename?: string;
  approval_status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  approval_notes?: string;
  error_message?: string;
  report_markdown?: string;
  quality_scorecard?: string;
  research_summary?: string;
  events?: AgentEvent[];
}

export interface SystemHealth {
  status: string;
  version: string;
  gemini_model: string;
  database: string;
}
