import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  FileText,
  Activity,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  Search,
  Check,
  Database,
} from "lucide-react";
import type { Task, SystemHealth } from "./types";
import {
  fetchHealth,
  fetchTasks,
  fetchTaskDetail,
  submitNewTask,
  submitTaskApproval,
  getReportDownloadUrl,
} from "./api";
import "./App.css";

const PRESET_PROMPTS = [
  "Research the Indian kidswear e-commerce market, analyze the competitive landscape, and design a 30-day marketing plan.",
  "Investigate the growth of quick-commerce grocery apps in tier-2 Indian cities with customer acquisition risks.",
  "Evaluate B2B SaaS sales automation tools for small manufacturing firms with implementation barriers.",
];

export function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"report" | "timeline" | "audit" | "governance">("report");
  
  // New Task Form State
  const [queryInput, setQueryInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  
  // Governance State
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load & Health Check
  useEffect(() => {
    loadHealth();
    loadTasks();
  }, []);

  // 2. Polling for Active Tasks
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
      if (selectedTaskId) {
        loadTaskDetail(selectedTaskId, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedTaskId]);

  async function loadHealth() {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }

  async function loadTasks() {
    try {
      const data = await fetchTasks();
      setTasks(data);
      if (!selectedTaskId && data.length > 0) {
        setSelectedTaskId(data[0].id);
        loadTaskDetail(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTaskDetail(id: string, updateSelection = true) {
    try {
      const detail = await fetchTaskDetail(id);
      setActiveTask(detail);
      if (updateSelection) {
        setSelectedTaskId(id);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLaunchTask(e: React.FormEvent) {
    e.preventDefault();
    if (!queryInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTask = await submitNewTask(queryInput, selectedFile);
      setQueryInput("");
      setSelectedFile(null);
      await loadTasks();
      setSelectedTaskId(newTask.id);
      setActiveTab("timeline");
      await loadTaskDetail(newTask.id);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start task";
      alert("Submission error: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApproval(approved: boolean) {
    if (!selectedTaskId || isApproving) return;
    setIsApproving(true);
    try {
      const updated = await submitTaskApproval(selectedTaskId, approved, approvalNotes);
      setActiveTask(updated);
      setApprovalNotes("");
      await loadTasks();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to approve";
      alert("Approval error: " + errorMsg);
    } finally {
      setIsApproving(false);
    }
  }

  function handleCopyReport() {
    if (!activeTask?.report_markdown) return;
    navigator.clipboard.writeText(activeTask.report_markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  }

  const filteredTasks = tasks.filter((t) =>
    t.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <span className="brand-title">AgentFlow AI</span>
          </div>
          <span className="brand-badge">Enterprise Multi-Agent</span>
        </div>

        <div className="header-meta">
          <div className="status-pill">
            <span className={`status-dot ${health ? "online" : "offline"}`} />
            <span>{health ? "Backend Online" : "Connecting..."}</span>
          </div>

          <div className="status-pill">
            <Sparkles size={14} color="#60a5fa" />
            <span>{health?.gemini_model || "gemini/gemini-3.5-flash"}</span>
          </div>

          <button
            className="refresh-btn"
            onClick={() => {
              loadHealth();
              loadTasks();
              if (selectedTaskId) loadTaskDetail(selectedTaskId);
            }}
            title="Refresh Tasks"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-actions">
            <button
              className="primary-btn"
              onClick={() => {
                setSelectedTaskId(null);
                setActiveTask(null);
              }}
            >
              <Sparkles size={16} />
              <span>Launch New Workflow</span>
            </button>

            <div className="search-input-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Filter task history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: "13px" }}>
                No workflows found. Launch your first research task!
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isActive = selectedTaskId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`task-item-card ${isActive ? "active" : ""}`}
                    onClick={() => loadTaskDetail(t.id)}
                  >
                    <div className="task-card-header">
                      <span className={`task-status-tag tag-${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                      <span className="task-date">
                        {new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="task-query-snippet">{t.query}</div>
                    {t.csv_filename && (
                      <div style={{ fontSize: "11px", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Database size={11} />
                        <span>{t.csv_filename}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Center / Right Content Workspace */}
        <main className="main-workspace">
          {!selectedTaskId || !activeTask ? (
            /* Launch Form View */
            <div className="launch-container animate-fade-in">
              <div className="launch-header">
                <h1>Multi-Agent Autonomous Strategy Engine</h1>
                <p>
                  Deploy specialized CrewAI agents powered by Google Gemini to perform live market research,
                  conduct safe statistical data profiling, synthesize executive business reports, and enforce editorial quality.
                </p>
              </div>

              <div className="preset-pills-bar">
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-pill-btn"
                    onClick={() => setQueryInput(preset)}
                  >
                    "{preset.slice(0, 48)}..."
                  </button>
                ))}
              </div>

              <form onSubmit={handleLaunchTask} className="form-card">
                <div className="input-group">
                  <label>Business Objective or Market Query</label>
                  <textarea
                    className="prompt-textarea"
                    placeholder="E.g., Research the Indian kidswear e-commerce market, analyze available retail data, identify key competitors, and create a 30-day marketing plan..."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Optional Business Dataset (.csv / .tsv)</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,.tsv"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div
                    className="file-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={22} color="var(--accent-blue)" />
                    {selectedFile ? (
                      <div>
                        <strong style={{ color: "var(--accent-cyan)" }}>{selectedFile.name}</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB — Click to change file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <strong>Click or Drag a CSV dataset to attach</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                          Our Data Analyst Agent will compute descriptive statistics and anomalies without executing arbitrary code.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                  style={{ alignSelf: "flex-start", padding: "12px 24px" }}
                  disabled={isSubmitting || !queryInput.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin-slow" />
                      <span>Coordinating Multi-Agent Crew...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Kickoff AgentFlow Crew</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Active Task Details View */
            <div className="detail-container animate-fade-in">
              <div className="detail-top-bar">
                <div className="detail-title-group">
                  <h2>{activeTask.query}</h2>
                  <div className="detail-meta-row">
                    <span className={`task-status-tag tag-${activeTask.status.toLowerCase()}`}>
                      {activeTask.status}
                    </span>
                    <span>Started: {new Date(activeTask.created_at).toLocaleString()}</span>
                    {activeTask.elapsed_seconds && (
                      <span>Duration: {activeTask.elapsed_seconds}s</span>
                    )}
                    {activeTask.csv_filename && (
                      <span style={{ color: "var(--accent-cyan)" }}>
                        Dataset: {activeTask.csv_filename}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {activeTask.report_markdown && (
                    <>
                      <button className="preset-pill-btn" onClick={handleCopyReport}>
                        {copiedReport ? <Check size={14} /> : <FileText size={14} />}
                        <span>{copiedReport ? "Copied" : "Copy Report"}</span>
                      </button>
                      <a
                        href={getReportDownloadUrl(activeTask.id)}
                        className="preset-pill-btn"
                        style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
                        download
                      >
                        <Download size={14} />
                        <span>Download Markdown</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="detail-nav-tabs">
                <button
                  className={`nav-tab-btn ${activeTab === "report" ? "active" : ""}`}
                  onClick={() => setActiveTab("report")}
                >
                  <FileText size={16} />
                  <span>Executive Report</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
                  onClick={() => setActiveTab("timeline")}
                >
                  <Activity size={16} />
                  <span>Agent Timeline & Trace ({activeTask.events?.length || 0})</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === "audit" ? "active" : ""}`}
                  onClick={() => setActiveTab("audit")}
                >
                  <ShieldCheck size={16} />
                  <span>Quality Scorecard</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === "governance" ? "active" : ""}`}
                  onClick={() => setActiveTab("governance")}
                >
                  <UserCheck size={16} />
                  <span>Human Governance ({activeTask.approval_status})</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="detail-tab-body">
                {activeTab === "report" && (
                  <div className="report-paper">
                    {activeTask.status === "RUNNING" || activeTask.status === "QUEUED" ? (
                      <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <RefreshCw size={36} className="animate-spin-slow" color="var(--accent-blue)" style={{ margin: "0 auto 16px" }} />
                        <h3 style={{ marginBottom: "8px" }}>Agents Are Assembling Your Deliverable</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                          Researcher is querying web sources and Analyst is profiling metrics. Check the Timeline tab for live agent steps.
                        </p>
                      </div>
                    ) : activeTask.report_markdown ? (
                      <div
                        className="markdown-body"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownToHtml(activeTask.report_markdown),
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
                        No report output generated.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="timeline-stream">
                    {activeTask.events && activeTask.events.length > 0 ? (
                      activeTask.events.map((ev) => (
                        <div key={ev.id} className="timeline-event-card">
                          <div className="timeline-badge">
                            <Bot size={18} color="var(--accent-blue)" />
                          </div>
                          <div className="timeline-info">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="timeline-agent-name">{ev.agent_name}</span>
                              <span className="timeline-time">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="timeline-msg">{ev.message}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
                        Workflow registered. Awaiting initial agent dispatch...
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="report-paper">
                    <h2 style={{ marginBottom: "16px", color: "var(--accent-emerald)" }}>
                      Fact-Check & Quality Review Audit
                    </h2>
                    {activeTask.quality_scorecard ? (
                      <div
                        className="markdown-body"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownToHtml(activeTask.quality_scorecard),
                        }}
                      />
                    ) : (
                      <p style={{ color: "var(--text-dim)" }}>
                        Quality scorecard will be compiled upon report completion.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "governance" && (
                  <div className="governance-card">
                    <h3>Human-in-the-Loop Approval & Governance</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                      Enforce human oversight before taking downstream actions (e.g., publishing marketing copy, sending client deliverables, or launching ad spend).
                    </p>

                    <div style={{ padding: "16px", borderRadius: "8px", background: "var(--bg-tertiary)" }}>
                      <strong>Current Decision: </strong>
                      <span className={`task-status-tag tag-${activeTask.approval_status.toLowerCase()}`}>
                        {activeTask.approval_status}
                      </span>
                      {activeTask.approval_notes && (
                        <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                          <strong>Notes: </strong> {activeTask.approval_notes}
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label>Reviewer Feedback or Instructions</label>
                      <input
                        type="text"
                        placeholder="E.g., Approved for client deck distribution."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        style={{
                          width: "100%",
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "10px 14px",
                          color: "white",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="primary-btn"
                        style={{ background: "var(--accent-emerald)" }}
                        disabled={isApproving}
                        onClick={() => handleApproval(true)}
                      >
                        <CheckCircle size={16} />
                        <span>Approve Deliverable</span>
                      </button>
                      <button
                        className="primary-btn"
                        style={{ background: "var(--accent-rose)" }}
                        disabled={isApproving}
                        onClick={() => handleApproval(false)}
                      >
                        <XCircle size={16} />
                        <span>Reject / Request Changes</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function renderMarkdownToHtml(md: string): string {
  if (!md) return "";
  
  let html = md
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/^---$/gim, "<hr style='border:none; border-top:1px solid rgba(255,255,255,0.1); margin:24px 0;' />")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^- (.*$)/gim, "<li>$1</li>");

  const lines = html.split("\n\n");
  html = lines
    .map((l) => {
      if (l.startsWith("<h") || l.startsWith("<hr") || l.startsWith("<li")) {
        return l;
      }
      return `<p>${l}</p>`;
    })
    .join("");

  return html;
}

export default App;
