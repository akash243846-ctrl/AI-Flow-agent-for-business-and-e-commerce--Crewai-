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
  Layers,
  TrendingUp,
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
  {
    category: "D2C E-Commerce",
    title: "Indian Kidswear D2C Strategy",
    prompt: "Research the Indian kidswear e-commerce market, analyze FirstCry and Hopscotch competitor dynamics, evaluate unit economics, and create an aggressive 30-day marketing plan.",
  },
  {
    category: "Quick-Commerce",
    title: "Quick-Commerce vs Marketplaces",
    prompt: "Analyze the operational and margin differences between selling on Quick-Commerce (Blinkit, Zepto, Swiggy Instamart) vs traditional Marketplaces (Amazon, Flipkart) for Indian CPG brands.",
  },
  {
    category: "B2B SaaS",
    title: "B2B SaaS Churn & Pricing",
    prompt: "Evaluate B2B sales automation CRM tools for small and medium manufacturing enterprises. Analyze integration barriers, customer churn patterns, and a 30-day rollout roadmap.",
  },
  {
    category: "Dropshipping & Export",
    title: "Cross-Border E-Commerce",
    prompt: "Formulate a cross-border e-commerce expansion blueprint for Indian home decor and apparel brands targeting US and GCC markets via Shopify and international logistics.",
  },
  {
    category: "Performance Marketing",
    title: "CAC / ROAS Unit Economics",
    prompt: "Develop a unit economics optimization framework for high-return D2C apparel brands. Address RTO (Return to Origin) reduction, Meta Ads CAC inflation, and retention strategies.",
  },
];

export function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // FIX: Dedicated state to ensure "Launch New Workflow" NEVER closes while typing
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const [activeTab, setActiveTab] = useState<"report" | "agents" | "timeline" | "audit" | "governance">("report");
  
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

  // 1. Initial Load: auto-select first task if available
  useEffect(() => {
    loadHealth();
    loadTasks(true);
  }, []);

  // 2. Polling for Active Tasks (autoSelect = false so it NEVER interrupts user typing)
  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks(false);
      if (selectedTaskId && !isCreatingNew) {
        loadTaskDetail(selectedTaskId, false);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedTaskId, isCreatingNew]);

  async function loadHealth() {
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  }

  async function loadTasks(autoSelect = false) {
    try {
      const data = await fetchTasks();
      setTasks(data);
      // Only auto-select on initial page load if not already in creation mode
      if (autoSelect && !selectedTaskId && !isCreatingNew && data.length > 0) {
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

  function handleStartNewWorkflow() {
    setIsCreatingNew(true);
  }

  async function handleLaunchTask(e: React.FormEvent) {
    e.preventDefault();
    if (!queryInput.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTask = await submitNewTask(queryInput, selectedFile);
      setQueryInput("");
      setSelectedFile(null);
      setIsCreatingNew(false);
      await loadTasks(false);
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
      await loadTasks(false);
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
          <span className="brand-badge">Multi-Agent Business OS</span>
        </div>

        <div className="header-meta">
          <div className="status-pill">
            <span className={`status-dot ${health ? "online" : "offline"}`} />
            <span>{health ? "Backend Live" : "Connecting..."}</span>
          </div>

          <div className="status-pill">
            <Sparkles size={14} color="#60a5fa" />
            <span>{health?.gemini_model || "gemini/gemini-3.1-flash-lite"}</span>
          </div>

          <button
            className="refresh-btn"
            onClick={() => {
              loadHealth();
              loadTasks(false);
              if (selectedTaskId) loadTaskDetail(selectedTaskId);
            }}
            title="Refresh State"
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
              onClick={handleStartNewWorkflow}
            >
              <Sparkles size={16} />
              <span>Launch New Workflow</span>
            </button>

            <div className="search-input-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search business history..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: "13px" }}>
                No workflows found. Launch your first business task!
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isActive = !isCreatingNew && selectedTaskId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`task-item-card ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setIsCreatingNew(false);
                      loadTaskDetail(t.id);
                    }}
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
          {isCreatingNew || !activeTask ? (
            /* Launch Form View - STABLE, NEVER CLOSES UNTIL SUBMITTED OR CANCELLED */
            <div className="launch-container animate-fade-in">
              <div className="launch-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h1>Universal Business & E-Commerce Strategy Engine</h1>
                    <p>
                      Deploy specialized CrewAI agents powered by Google Gemini and Serper Google Search
                      to answer any business, marketplace, D2C, B2B, pricing, or supply chain challenge in rigorous detail.
                    </p>
                  </div>
                  {activeTask && (
                    <button
                      className="preset-pill-btn"
                      onClick={() => setIsCreatingNew(false)}
                      style={{ padding: "6px 14px", background: "rgba(255,255,255,0.06)" }}
                    >
                      Back to Current Report
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Prompts Section */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", display: "block" }}>
                  Featured Business & E-Commerce Blueprint Presets:
                </label>
                <div className="preset-pills-bar">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-pill-btn"
                      onClick={() => setQueryInput(preset.prompt)}
                    >
                      <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{preset.category}: </span>
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLaunchTask} className="form-card">
                <div className="input-group">
                  <label>Business Objective, E-Commerce Query, or Market Challenge</label>
                  <textarea
                    className="prompt-textarea"
                    placeholder="Enter any business topic... E.g., How can an Indian D2C footwear brand scale from Rs 10 Lakhs/month to Rs 1 Crore/month on Shopify? Include CAC reduction, Meta Ads funnel, supplier negotiations, and a 30-day action plan."
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                    {queryInput.length} characters (Detailed prompts produce richer multi-thousand-word executive deliverables)
                  </div>
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
                        <strong>Attach a CSV dataset for quantitative profiling (Optional)</strong>
                        <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                          Our Data Analyst Agent computes sales distributions, return rates, and unit economics without executing arbitrary code.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    type="submit"
                    className="primary-btn"
                    style={{ padding: "12px 28px" }}
                    disabled={isSubmitting || !queryInput.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin-slow" />
                        <span>Deploying 5 Autonomous Agents...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Kickoff AgentFlow Crew</span>
                      </>
                    )}
                  </button>

                  {activeTask && (
                    <button
                      type="button"
                      className="preset-pill-btn"
                      onClick={() => setIsCreatingNew(false)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                  <span>Executive Strategy Report</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === "agents" ? "active" : ""}`}
                  onClick={() => setActiveTab("agents")}
                >
                  <Layers size={16} />
                  <span>Agent Work & Roles</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeTab === "timeline" ? "active" : ""}`}
                  onClick={() => setActiveTab("timeline")}
                >
                  <Activity size={16} />
                  <span>Execution Timeline ({activeTask.events?.length || 0})</span>
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
                {/* TAB 1: EXECUTIVE REPORT */}
                {activeTab === "report" && (
                  <div className="report-paper">
                    {activeTask.status === "RUNNING" || activeTask.status === "QUEUED" ? (
                      <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <RefreshCw size={36} className="animate-spin-slow" color="var(--accent-blue)" style={{ margin: "0 auto 16px" }} />
                        <h3 style={{ marginBottom: "8px" }}>Agents Are Assembling Your Deliverable</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                          Researcher is searching Google via Serper, Analyst is calculating unit economics, and Writer is drafting the report. Check the Timeline tab for live agent steps.
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

                {/* TAB 2: AGENT WORK BREAKDOWN */}
                {activeTab === "agents" && (
                  <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "18px", color: "#ffffff", marginBottom: "4px" }}>Multi-Agent Collaboration Architecture</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        Here is the exact role, tool suite, and output contribution delivered by each specialized agent for this task:
                      </p>
                    </div>

                    {/* Agent 1: Supervisor */}
                    <div className="agent-detail-card">
                      <div className="agent-header-row">
                        <div className="agent-avatar-box supervisor-avatar">
                          <Layers size={20} color="#60a5fa" />
                        </div>
                        <div>
                          <div className="agent-role-title">1. Strategic Project Supervisor</div>
                          <div className="agent-role-sub">Workflow Orchestration & Task Scoping</div>
                        </div>
                        <span className="agent-status-badge">COMPLETED</span>
                      </div>
                      <div className="agent-body-text">
                        <strong>Responsibility:</strong> Analyzed the user's objective (<em>"{activeTask.query.slice(0, 100)}..."</em>), deconstructed it into sequential milestones, set quality parameters, and metered LLM request rates to prevent quota spikes.
                      </div>
                    </div>

                    {/* Agent 2: Researcher */}
                    <div className="agent-detail-card">
                      <div className="agent-header-row">
                        <div className="agent-avatar-box researcher-avatar">
                          <Search size={20} color="#34d399" />
                        </div>
                        <div>
                          <div className="agent-role-title">2. Principal Market & Competitor Researcher</div>
                          <div className="agent-role-sub">Google Search (Serper API) & Evidence Gathering</div>
                        </div>
                        <span className="agent-status-badge">COMPLETED</span>
                      </div>
                      <div className="agent-body-text">
                        <strong>Responsibility:</strong> Scoured live Google Search for industry players, pricing points, customer reviews, and market valuations. Extracted verifiable URLs and applied anti-prompt-injection fences.
                      </div>
                      {activeTask.research_summary && (
                        <div className="agent-output-preview">
                          <strong>Raw Intelligence Preview:</strong>
                          <div style={{ marginTop: "6px", maxHeight: "140px", overflowY: "auto", fontSize: "12px", color: "#cbd5e1" }}>
                            {activeTask.research_summary.slice(0, 500)}...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Agent 3: Data Analyst */}
                    <div className="agent-detail-card">
                      <div className="agent-header-row">
                        <div className="agent-avatar-box analyst-avatar">
                          <TrendingUp size={20} color="#fbbf24" />
                        </div>
                        <div>
                          <div className="agent-role-title">3. Quantitative Business Data Analyst</div>
                          <div className="agent-role-sub">Pandas Statistical Profiling & Unit Economics</div>
                        </div>
                        <span className="agent-status-badge">{activeTask.csv_filename ? "ACTIVE" : "STANDBY"}</span>
                      </div>
                      <div className="agent-body-text">
                        <strong>Responsibility:</strong> {activeTask.csv_filename ? `Profiled ${activeTask.csv_filename} using deterministic Pandas calculations, measuring SKU volumes, return percentages, and margins without executing arbitrary LLM code.` : "Evaluated market-standard unit economics (CAC, LTV, ROAS, AOV, Contribution Margin) based on sector benchmarks."}
                      </div>
                    </div>

                    {/* Agent 4: Report Writer */}
                    <div className="agent-detail-card">
                      <div className="agent-header-row">
                        <div className="agent-avatar-box writer-avatar">
                          <FileText size={20} color="#a78bfa" />
                        </div>
                        <div>
                          <div className="agent-role-title">4. Executive Strategy Report Writer</div>
                          <div className="agent-role-sub">Boardroom Synthesis & 30-Day Execution Plan</div>
                        </div>
                        <span className="agent-status-badge">COMPLETED</span>
                      </div>
                      <div className="agent-body-text">
                        <strong>Responsibility:</strong> Merged qualitative market evidence and quantitative metrics into a structured 8-section Markdown deliverable with competitive comparison tables, phased weekly roadmaps, and risk mitigation strategies.
                      </div>
                    </div>

                    {/* Agent 5: Quality Auditor */}
                    <div className="agent-detail-card">
                      <div className="agent-header-row">
                        <div className="agent-avatar-box reviewer-avatar">
                          <ShieldCheck size={20} color="#f43f5e" />
                        </div>
                        <div>
                          <div className="agent-role-title">5. Quality & Fact-Check Auditor</div>
                          <div className="agent-role-sub">Rigorous Fact-Checking & Editorial Scorecard</div>
                        </div>
                        <span className="agent-status-badge">COMPLETED</span>
                      </div>
                      <div className="agent-body-text">
                        <strong>Responsibility:</strong> Scrutinized the report for missing sections, unrealistic claims, or ungrounded statistics. Compiled the numerical Quality Scorecard and issued the final sign-off recommendation.
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TIMELINE */}
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

                {/* TAB 4: AUDIT SCORECARD */}
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

                {/* TAB 5: GOVERNANCE */}
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
                        placeholder="E.g., Approved for executive distribution and ad campaign launch."
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

// Robust, comprehensive Markdown to HTML parser supporting tables, headers, lists, and quotes
function renderMarkdownToHtml(md: string): string {
  if (!md) return "";

  const lines = md.split("\n");
  const output: string[] = [];
  let inTable = false;
  let tableHeaderParsed = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check for Table Row
    if (line.startsWith("|") && line.endsWith("|")) {
      if (line.match(/^\|[\s\-:|]+\|$/)) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        if (inList) { output.push("</ul>"); inList = false; }
        output.push("<table><tbody>");
        inTable = true;
        tableHeaderParsed = false;
      }

      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!tableHeaderParsed) {
        output.push("<tr>" + cells.map((c) => `<th>${formatInline(c)}</th>`).join("") + "</tr>");
      } else {
        output.push("<tr>" + cells.map((c) => `<td>${formatInline(c)}</td>`).join("") + "</tr>");
      }
      continue;
    } else {
      if (inTable) {
        output.push("</tbody></table>");
        inTable = false;
        tableHeaderParsed = false;
      }
    }

    // Check for List item
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${formatInline(line.slice(2))}</li>`);
      continue;
    } else {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // Headers
    if (line.startsWith("# ")) {
      output.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      output.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      output.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith("#### ")) {
      output.push(`<h4>${formatInline(line.slice(5))}</h4>`);
    } else if (line.startsWith("---")) {
      output.push("<hr style='border:none; border-top:1px solid rgba(255,255,255,0.12); margin:24px 0;' />");
    } else if (line.startsWith("> ")) {
      output.push(`<blockquote>${formatInline(line.slice(2))}</blockquote>`);
    } else {
      output.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inTable) output.push("</tbody></table>");
  if (inList) output.push("</ul>");

  return output.join("\n");
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code style='background:rgba(255,255,255,0.08); padding:2px 5px; border-radius:4px;'>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color:#60a5fa; text-decoration:underline;'>$1</a>");
}

export default App;
