import type { Task, SystemHealth } from "./types";

const API_BASE = "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend offline");
  return res.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function fetchTaskDetail(taskId: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`);
  if (!res.ok) throw new Error("Task not found");
  return res.json();
}

export async function submitNewTask(query: string, file?: File | null): Promise<Task> {
  const formData = new FormData();
  formData.append("query", query);
  if (file) {
    formData.append("dataset", file);
  }

  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Submission failed" }));
    throw new Error(err.detail || "Submission failed");
  }

  return res.json();
}

export async function submitTaskApproval(taskId: string, approved: boolean, notes: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${taskId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved, notes }),
  });

  if (!res.ok) throw new Error("Failed to update approval");
  return res.json();
}

export function getReportDownloadUrl(taskId: string): string {
  return `${API_BASE}/api/tasks/${taskId}/report`;
}
