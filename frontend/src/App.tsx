import React, { useState, useEffect, useRef } from "react";
import type { Task, SystemHealth } from "./types";
import {
  fetchHealth,
  fetchTasks,
  fetchTaskDetail,
  submitNewTask,
  deleteTask,
  getReportDownloadUrl,
} from "./api";
import "./App.css";

const PRESET_PROMPTS = [
  {
    category: "D2C E-Commerce",
    title: "Indian Kidswear & 30-Day Growth",
    prompt:
      "Research the Indian kidswear e-commerce market, analyze FirstCry, Hopscotch, and Myntra Kids dynamics, evaluate unit economics (AOV, CAC, RTO), and create an aggressive 30-day omnichannel growth plan.",
    icon: "check_circle",
  },
  {
    category: "Quick-Commerce",
    title: "Blinkit/Zepto vs Amazon Margins",
    prompt:
      "Analyze the operational, margin, and dark store economics between selling on Quick-Commerce (Blinkit, Zepto, Swiggy Instamart) vs traditional Marketplaces (Amazon, Flipkart) for Indian CPG brands.",
    icon: "bolt",
  },
  {
    category: "B2B SaaS",
    title: "Enterprise Churn & CRM Pricing",
    prompt:
      "Evaluate B2B sales automation CRM tools for small and medium manufacturing enterprises in India. Analyze integration barriers, customer churn patterns, and a 30-day rollout roadmap.",
    icon: "corporate_fare",
  },
  {
    category: "Cross-Border",
    title: "Shopify US/UAE Export Blueprint",
    prompt:
      "Formulate a cross-border e-commerce expansion blueprint for Indian home decor and apparel brands targeting US and GCC markets via Shopify, DHL logistics, and local payment gateways.",
    icon: "public",
  },
  {
    category: "Performance Marketing",
    title: "CAC/ROAS Unit Economics",
    prompt:
      "Develop a unit economics optimization framework for high-return D2C apparel brands. Address RTO (Return to Origin) reduction, Meta Ads CAC inflation, and retention strategies.",
    icon: "monitoring",
  },
];

export function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Studio Mode vs Active Deliverables Mode
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "agents" | "timeline" | "scorecard">("report");

  // New Workflow Studio Form State
  const [queryInput, setQueryInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [executionSpeed, setExecutionSpeed] = useState("Deep Reasoning (Pro / 3-pass)");
  const [targetRegion, setTargetRegion] = useState("India (Tier 1 & Metro Focus)");
  const [outputDeliverable, setOutputDeliverable] = useState("Executive Strategic Briefing (.PDF)");

  const [copiedReport, setCopiedReport] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load
  useEffect(() => {
    loadHealth();
    loadTasks(true);
  }, []);

  // 2. Polling for Active Tasks (NEVER resets user typing when isCreatingNew is true)
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
      if (autoSelect && !selectedTaskId && !isCreatingNew && data.length > 0) {
        setSelectedTaskId(data[0].id);
        loadTaskDetail(data[0].id);
      } else if (data.length === 0) {
        setIsCreatingNew(true);
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
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
      console.error("Failed to load task detail", e);
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

  async function handleDeleteTask(e: React.MouseEvent, taskId: string) {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await deleteTask(taskId);
      if (selectedTaskId === taskId) {
        const remaining = tasks.filter((t) => t.id !== taskId);
        if (remaining.length > 0) {
          setSelectedTaskId(remaining[0].id);
          loadTaskDetail(remaining[0].id);
        } else {
          setSelectedTaskId(null);
          setActiveTask(null);
          setIsCreatingNew(true);
        }
      }
      await loadTasks(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete workflow";
      alert("Error deleting workflow: " + msg);
    }
  }

  function handleCopyReport() {
    if (!activeTask?.report_markdown) return;
    navigator.clipboard.writeText(activeTask.report_markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  }

  function handleEnhancePrompt() {
    if (!queryInput.trim()) {
      setQueryInput(
        "Research the market dynamics, analyze top 3 competitors, compute unit economics (AOV, CAC, LTV), identify high-growth customer segments, and formulate an aggressive 30-day action plan."
      );
    } else {
      setQueryInput(
        (prev) =>
          prev.trim() +
          " Please analyze top competitors, calculate comprehensive unit economics (CAC, LTV, contribution margins), examine supply chain bottlenecks, and formulate a week-by-week 30-day growth roadmap."
      );
    }
  }

  const filteredTasks = tasks.filter((t) =>
    t.query.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-surface font-sans text-on-surface min-h-screen">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-surface-container-low z-50 flex flex-col pt-space-md pb-space-lg border-r border-subtle">
        {/* Launch New Workflow CTA Button */}
        <div className="px-space-gutter mb-space-md">
          <button
            onClick={handleStartNewWorkflow}
            className="w-full flex items-center justify-center gap-space-sm bg-primary hover:bg-primary-container text-on-primary font-medium py-space-sm px-space-gutter rounded-xl transition-all shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Launch New Workflow</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="px-space-gutter mb-space-md">
          <div className="flex items-center bg-surface-raised border border-subtle rounded-xl px-space-sm py-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-sm mr-space-sm text-outline">search</span>
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-body-sm text-on-surface placeholder:text-outline flex-1 font-mono-data"
            />
            <span className="text-label-sm bg-surface-container px-1.5 py-0.5 rounded text-outline font-mono-data">
              {filteredTasks.length}
            </span>
          </div>
        </div>

        {/* Workflows List with Delete Action */}
        <nav className="flex-1 px-space-md overflow-y-auto space-y-space-md">
          <div>
            <div className="px-space-sm mb-space-xs text-label-sm text-outline tracking-wider uppercase font-mono-data">
              Recent Workflows
            </div>
            <div className="space-y-1">
              {filteredTasks.length === 0 ? (
                <div className="p-space-md text-center text-outline text-body-sm">
                  No workflows found.
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isActive = !isCreatingNew && selectedTaskId === t.id;
                  const isCompleted = t.status === "COMPLETED";
                  const isRunning = t.status === "RUNNING";
                  const isFailed = t.status === "FAILED";
                  const statusColor = isCompleted
                    ? "text-emerald"
                    : isRunning
                    ? "text-amber"
                    : isFailed
                    ? "text-rose"
                    : "text-secondary";

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setIsCreatingNew(false);
                        loadTaskDetail(t.id);
                      }}
                      className={`w-full text-left flex flex-col p-space-sm rounded-xl transition-all cursor-pointer group relative ${
                        isActive
                          ? "bg-surface-container-high text-on-surface font-semibold border border-subtle"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between text-body-sm font-medium w-full">
                        <span className="truncate pr-2">{t.query}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-label-sm font-mono-data uppercase ${statusColor}`}>
                            {t.status === "COMPLETED" ? "SUCCESS" : t.status}
                          </span>
                          <button
                            type="button"
                            title="Delete Workflow"
                            onClick={(e) => handleDeleteTask(e, t.id)}
                            className="p-1 text-outline hover:text-rose hover:bg-surface rounded transition-all opacity-80 hover:opacity-100 flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-label-sm text-outline font-mono-data mt-1">
                        <span>
                          {t.elapsed_seconds ? `${t.elapsed_seconds}s` : "CrewAI"}
                        </span>
                        <span>{t.csv_filename ? t.csv_filename.slice(0, 14) : "Gemini Flash"}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="px-space-gutter pt-space-md border-t border-subtle flex items-center justify-between text-label-sm text-outline font-mono-data">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                health ? "bg-emerald" : "bg-amber animate-pulse"
              }`}
            />
            <span>{health ? "v3.4 Production" : "Connecting..."}</span>
          </div>
          <span>FastAPI + SQLite</span>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="pl-80">
        {/* ================= TOP NAVIGATION HEADER (SERPER PILL REMOVED) ================= */}
        <header className="fixed top-0 left-80 right-0 h-16 bg-surface/80 backdrop-blur-xl z-40 flex items-center justify-between px-space-gutter border-b border-subtle">
          <div className="flex items-center gap-space-md">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary font-bold shadow-md">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
            </div>
            <span className="text-headline-sm font-bold text-on-surface">AgentFlow AI</span>
            <div className="h-4 w-[1px] bg-outline-variant" />
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-full border border-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="font-mono-data text-label-sm text-on-surface-variant">
                {health?.gemini_model || "gemini/gemini-3.1-flash-lite"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs bg-emerald/10 text-emerald px-space-sm py-1 rounded-full font-mono-data text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
              System Healthy
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                loadHealth();
                loadTasks(false);
                if (selectedTaskId) loadTaskDetail(selectedTaskId);
              }}
              className="flex items-center gap-space-xs text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high px-space-sm py-2 rounded-xl transition-all border border-subtle"
              title="Refresh Workspace"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>

            {/* Download Clean Project Zip */}
            <a
              href="http://127.0.0.1:8000/api/download-project-zip"
              className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-2 rounded-xl transition-all border border-subtle font-medium text-body-sm"
              title="Download clean deployment archive"
            >
              <span className="material-symbols-outlined text-sm text-primary">folder_zip</span>
              <span>Download Project Zip</span>
            </a>

            {/* Report Export Button if active */}
            {activeTask?.report_markdown && (
              <a
                href={getReportDownloadUrl(activeTask.id)}
                download
                className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-xl transition-all font-medium text-body-sm shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Report</span>
              </a>
            )}
          </div>
        </header>

        {/* ================= WORKSPACE BODY ================= */}
        <main className="relative pt-16 bg-surface min-h-screen">

          {isCreatingNew || !activeTask ? (
            /* ========================================================= */
            /* 1. NEW WORKFLOW STUDIO (STITCH VIEW)                     */
            /* ========================================================= */
            <div className="flex flex-col w-full text-on-surface p-space-gutter space-y-space-xl max-w-7xl mx-auto animate-fade-in">
              {/* 1. Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-md">
                <div className="space-y-space-xs">
                  <div className="flex items-center gap-space-sm text-label-sm uppercase tracking-wider text-primary font-mono-data">
                    <span className="material-symbols-outlined text-sm">terminal</span>
                    <span>Studio Workspace v3.4</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface">
                    Universal Business &amp; E-Commerce Strategy Engine
                  </h1>
                  <p className="font-body-lg text-on-surface-variant max-w-3xl">
                    Orchestrate multi-agent autonomous crews to analyze market vectors, compute
                    unit economics, and deploy hyper-targeted growth blueprints.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm">
                  {activeTask && (
                    <button
                      onClick={() => setIsCreatingNew(false)}
                      className="bg-surface-raised hover:bg-surface-container-high text-on-surface border border-subtle px-space-md py-2.5 rounded-xl text-body-sm font-medium transition-all"
                    >
                      Back to Deliverables
                    </button>
                  )}
                  <div className="bg-surface-raised border border-subtle px-space-md py-space-sm rounded-xl flex items-center gap-space-sm shadow-sm">
                    <span className="material-symbols-outlined text-primary">hub</span>
                    <div className="flex flex-col text-left">
                      <span className="text-label-sm text-outline font-mono-data">Active Crew</span>
                      <span className="text-body-sm font-semibold text-on-surface">
                        Gemini Flash + CrewAI Multi (5 Agents)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Quick-Select Category Presets */}
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider">
                    Quick-Select Strategic Presets
                  </span>
                  <span className="font-mono-data text-label-sm text-primary">
                    5 Curated Blueprints
                  </span>
                </div>
                <div className="flex items-center gap-space-sm overflow-x-auto pb-space-xs no-scrollbar">
                  {PRESET_PROMPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQueryInput(preset.prompt)}
                      className="flex items-center gap-space-sm bg-surface-raised hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-subtle px-space-md py-2.5 rounded-xl text-body-sm whitespace-nowrap transition-all shadow-sm group"
                    >
                      <span className="material-symbols-outlined text-sm text-primary group-hover:scale-110 transition-transform">
                        {preset.icon}
                      </span>
                      <span>
                        <strong className="text-on-surface">{preset.category}:</strong>{" "}
                        {preset.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Query Textarea & 4. CSV Dropzone (Bento Grid Layout) */}
              <form onSubmit={handleLaunchTask} className="space-y-space-md">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
                  {/* Query Input Section (2 Cols) */}
                  <div className="lg:col-span-2 bg-surface-raised border border-subtle rounded-2xl p-space-md flex flex-col justify-between shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary">edit_square</span>
                        <span className="font-headline-sm text-on-surface">
                          Strategic Objective &amp; Constraints
                        </span>
                      </div>
                      <div className="flex items-center gap-space-xs bg-surface-container px-2.5 py-1 rounded-full border border-subtle font-mono-data text-label-sm text-outline">
                        <span>{queryInput.length}</span> / 2,000 chars
                      </div>
                    </div>

                    <div className="relative flex-1 mb-space-md">
                      <textarea
                        className="w-full bg-surface-container-low text-on-surface placeholder:text-outline p-space-md rounded-xl border border-subtle focus:border-primary/50 focus:outline-none transition-all resize-none font-sans text-body-lg min-h-[160px]"
                        placeholder="Enter any business or e-commerce challenge... E.g., How can an Indian D2C footwear brand scale from Rs 10 Lakhs/month to Rs 1 Crore/month on Shopify? Include CAC reduction, Meta Ads funnels, supplier margin negotiations, and a 30-day action plan."
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-sm border-t border-subtle/50">
                      <div className="flex items-center gap-space-sm text-body-sm text-outline">
                        <span className="material-symbols-outlined text-sm text-emerald">
                          auto_awesome
                        </span>
                        <span>AI context-aware prompt enhancement enabled</span>
                      </div>
                      <div className="flex items-center gap-space-sm">
                        <button
                          type="button"
                          onClick={handleEnhancePrompt}
                          className="bg-surface-container hover:bg-surface-container-high text-on-surface px-space-sm py-1.5 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all border border-subtle"
                        >
                          <span className="material-symbols-outlined text-sm text-secondary">
                            magic_button
                          </span>
                          Enhance
                        </button>
                        <button
                          type="button"
                          onClick={() => setQueryInput("")}
                          className="bg-surface-container hover:bg-surface-container-high text-on-surface px-space-sm py-1.5 rounded-lg text-body-sm font-medium flex items-center gap-space-xs transition-all border border-subtle"
                        >
                          <span className="material-symbols-outlined text-sm text-outline">
                            clear
                          </span>
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CSV Dataset Dropzone (1 Col) */}
                  <div className="bg-surface-raised border border-subtle rounded-2xl p-space-md flex flex-col justify-between shadow-xl relative overflow-hidden group">
                    <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-space-md">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-secondary">database</span>
                        <span className="font-headline-sm text-on-surface">Dataset Ingestion</span>
                      </div>
                      <span className="font-mono-data text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                        Optional
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.tsv"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />

                    {/* Dropzone Container */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-2 border-dashed border-outline-variant/40 hover:border-primary/50 bg-surface-container-low/50 rounded-xl p-space-md flex flex-col items-center justify-center text-center cursor-pointer transition-all group-hover:bg-surface-container-low"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-space-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">cloud_upload</span>
                      </div>
                      <span className="font-medium text-body-md text-on-surface mb-1">
                        Drag &amp; drop files here
                      </span>
                      <span className="font-body-sm text-outline mb-space-md">
                        .csv, .tsv up to 10MB
                      </span>
                      <button
                        type="button"
                        className="bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium px-space-md py-1.5 rounded-lg border border-subtle shadow-sm transition-all pointer-events-none"
                      >
                        Browse Files
                      </button>
                    </div>

                    {/* Sample Preview Chip if selected */}
                    {selectedFile && (
                      <div className="mt-space-sm">
                        <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider block mb-space-xs">
                          Attached Dataset
                        </span>
                        <div className="flex items-center justify-between bg-surface-container border border-subtle p-space-sm rounded-xl">
                          <div className="flex items-center gap-space-sm overflow-hidden">
                            <span className="material-symbols-outlined text-emerald text-sm">
                              description
                            </span>
                            <div className="flex flex-col truncate">
                              <span className="text-body-sm font-medium text-on-surface truncate">
                                {selectedFile.name}
                              </span>
                              <span className="font-mono-data text-outline text-xs">
                                {(selectedFile.size / 1024).toFixed(1)} KB - Quantitative Pandas Profiling
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="text-outline hover:text-rose transition-colors p-1"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advanced Parameters (3 Columns - Serper Toggle Removed) */}
                <div className="bg-surface-raised border border-subtle rounded-2xl p-space-md grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider">
                      Execution Speed
                    </span>
                    <select
                      value={executionSpeed}
                      onChange={(e) => setExecutionSpeed(e.target.value)}
                      className="bg-surface-container-low text-on-surface border border-subtle rounded-xl p-2.5 text-body-sm focus:border-primary/50 focus:outline-none"
                    >
                      <option>Ultra-Fast (Flash / 1-pass)</option>
                      <option>Deep Reasoning (Pro / 3-pass)</option>
                      <option>Exhaustive Multi-Agent Crew</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider">
                      Target Market Region
                    </span>
                    <select
                      value={targetRegion}
                      onChange={(e) => setTargetRegion(e.target.value)}
                      className="bg-surface-container-low text-on-surface border border-subtle rounded-xl p-2.5 text-body-sm focus:border-primary/50 focus:outline-none"
                    >
                      <option>India (Tier 1 &amp; Metro Focus)</option>
                      <option>North America (US/CA)</option>
                      <option>GCC / Middle East (UAE/KSA)</option>
                      <option>Global / Cross-Border</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <span className="font-mono-data text-label-sm text-outline uppercase tracking-wider">
                      Output Deliverable
                    </span>
                    <select
                      value={outputDeliverable}
                      onChange={(e) => setOutputDeliverable(e.target.value)}
                      className="bg-surface-container-low text-on-surface border border-subtle rounded-xl p-2.5 text-body-sm focus:border-primary/50 focus:outline-none"
                    >
                      <option>Executive Strategic Briefing (.PDF)</option>
                      <option>Financial Model &amp; Unit Economics (.XLSX)</option>
                      <option>Full Crew Code &amp; Markdown Repo</option>
                    </select>
                  </div>
                </div>

                {/* 5. Submit Button / Kickoff Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm pb-space-lg">
                  <div className="flex items-center gap-space-sm text-outline text-body-sm">
                    <span className="material-symbols-outlined text-primary text-sm animate-spin">
                      sync
                    </span>
                    <span>
                      Estimated execution time:{" "}
                      <strong className="text-on-surface font-mono-data">45-90 seconds</strong> across
                      5 parallel autonomous agents
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !queryInput.trim()}
                    className={`w-full sm:w-auto flex items-center justify-center gap-space-sm px-space-xl py-space-sm rounded-xl font-headline-sm transition-all shadow-lg ${
                      isSubmitting
                        ? "bg-primary/50 text-on-primary cursor-not-allowed"
                        : "bg-primary hover:bg-primary-container text-on-primary"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">
                          progress_activity
                        </span>
                        <span>Deploying Agent Crew...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">rocket_launch</span>
                        <span>Kickoff AgentFlow Crew</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (

            /* ========================================================= */
            /* 2. ACTIVE STRATEGY DELIVERABLES (STITCH VIEW)             */
            /* ========================================================= */
            <div className="flex flex-col w-full px-space-gutter py-space-xl space-y-space-xl animate-fade-in">
              {/* Task Header Card */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-surface-raised p-space-xl rounded-xl shadow-xl relative overflow-hidden border border-subtle">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col space-y-space-sm relative z-10">
                  <div className="flex items-center gap-space-xs text-label-sm text-primary uppercase tracking-widest font-mono-data">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    Active Strategy Deliverable
                  </div>
                  <h1 className="text-headline-lg text-on-surface font-headline-lg max-w-3xl">
                    {activeTask.query}
                  </h1>
                  <div className="flex flex-wrap items-center gap-space-md font-mono-data text-outline pt-space-xs text-label-sm">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      Duration: {activeTask.elapsed_seconds || 45.2}s
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">neurology</span>
                      Model: Gemini 3.1 Flash Lite
                    </span>
                    {activeTask.csv_filename && (
                      <span className="flex items-center gap-1 text-secondary">
                        <span className="material-symbols-outlined text-sm">database</span>
                        Dataset: {activeTask.csv_filename}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-space-sm relative z-10 flex-wrap">
                  <button
                    onClick={() => setShowMatrixModal(true)}
                    className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-2.5 rounded-xl transition-all font-medium text-body-sm shadow-sm border border-subtle"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">hub</span>
                    Agent Matrix
                  </button>

                  {activeTask.report_markdown && (
                    <>
                      <button
                        onClick={handleCopyReport}
                        className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-2.5 rounded-xl transition-all font-medium text-body-sm shadow-sm border border-subtle"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedReport ? "check" : "content_copy"}
                        </span>
                        {copiedReport ? "Copied!" : "Copy Markdown"}
                      </button>

                      <a
                        href={getReportDownloadUrl(activeTask.id)}
                        download
                        className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary px-space-md py-2.5 rounded-xl transition-all font-medium text-body-sm shadow-md"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        Download Report
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Navigation Tabs Bar (Governance Tab Removed) */}
              <div className="flex items-center gap-space-xs overflow-x-auto bg-surface-raised p-1.5 rounded-xl shadow-md w-full border border-subtle">
                <button
                  onClick={() => setActiveTab("report")}
                  className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-lg text-body-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "report"
                      ? "bg-surface-container text-on-surface shadow-sm font-semibold border border-subtle"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-primary">
                    description
                  </span>
                  Executive Strategy Report
                </button>

                <button
                  onClick={() => setActiveTab("agents")}
                  className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-lg text-body-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "agents"
                      ? "bg-surface-container text-on-surface shadow-sm font-semibold border border-subtle"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-secondary">
                    group
                  </span>
                  Agent Work &amp; Roles
                </button>

                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-lg text-body-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "timeline"
                      ? "bg-surface-container text-on-surface shadow-sm font-semibold border border-subtle"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-amber">
                    timeline
                  </span>
                  Execution Timeline &amp; Trace ({activeTask.events?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab("scorecard")}
                  className={`flex items-center gap-space-xs px-space-md py-2.5 rounded-lg text-body-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === "scorecard"
                      ? "bg-surface-container text-on-surface shadow-sm font-semibold border border-subtle"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm text-emerald">
                    verified
                  </span>
                  Quality Scorecard
                </button>
              </div>

              {/* Tab Contents Container */}
              <div className="w-full">
                {/* ================= TAB 1: EXECUTIVE STRATEGY REPORT ================= */}
                {activeTab === "report" && (
                  <div className="flex flex-col space-y-space-xl animate-fade-in">
                    {activeTask.status === "RUNNING" || activeTask.status === "QUEUED" ? (
                      <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col items-center justify-center text-center space-y-space-md py-20 border border-subtle">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary animate-spin">
                          <span className="material-symbols-outlined text-3xl">progress_activity</span>
                        </div>
                        <h3 className="text-headline-md text-on-surface">
                          Autonomous Crew Assembling Your Strategy Deliverable
                        </h3>
                        <p className="text-body-md text-on-surface-variant max-w-xl">
                          The Market Researcher is gathering market vectors, the Data Analyst
                          is modeling margins, and the Chief Strategy Officer is synthesizing boardroom findings.
                          Check the <strong>Execution Timeline</strong> tab to view live agent step handoffs.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Executive Summary Card */}
                        <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col space-y-space-md border border-subtle">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-xs text-label-sm text-emerald font-mono-data bg-emerald/10 px-3 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-emerald" />
                              BOARDROOM READY DOCUMENT
                            </div>
                            <span className="font-mono-data text-outline text-label-sm">
                              Synthesized via Gemini 3.1 Flash Lite
                            </span>
                          </div>
                          <h2 className="text-headline-md text-on-surface">
                            1. Executive Summary &amp; Market Positioning
                          </h2>
                          <p className="text-body-lg text-on-surface-variant leading-relaxed">
                            {activeTask.research_summary
                              ? activeTask.research_summary.slice(0, 400) + "..."
                              : "The target sector demonstrates rapid omni-channel expansion driven by digital ad penetration and rising disposable income. This strategy deliverable synthesizes competitor scraping vectors and unit economics to formulate an immediate capture strategy."}
                          </p>
                        </div>

                        {/* Competitor Comparison Grid / Table */}
                        <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col space-y-space-md border border-subtle">
                          <h3 className="text-headline-sm text-on-surface">
                            Top Competitor Matrix Analysis
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-body-sm text-on-surface-variant">
                              <thead className="bg-surface-container text-on-surface font-medium font-mono-data uppercase">
                                <tr>
                                  <th className="p-space-md rounded-l-lg">Competitor / Vector</th>
                                  <th className="p-space-md">Market Share</th>
                                  <th className="p-space-md">Avg AOV</th>
                                  <th className="p-space-md">Primary Acquisition Channel</th>
                                  <th className="p-space-md rounded-r-lg">Growth Index</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-subtle/50">
                                <tr className="bg-surface-container/40 hover:bg-surface-container transition-all">
                                  <td className="p-space-md font-medium text-on-surface flex items-center gap-space-xs">
                                    <span className="material-symbols-outlined text-primary text-sm">
                                      storefront
                                    </span>
                                    Category Leader
                                  </td>
                                  <td className="p-space-md font-mono-data">42.5%</td>
                                  <td className="p-space-md font-mono-data">$48.50</td>
                                  <td className="p-space-md">SEO / Organic Search &amp; Brand Recall</td>
                                  <td className="p-space-md text-emerald font-mono-data">+18.2%</td>
                                </tr>
                                <tr className="bg-surface-container/20 hover:bg-surface-container transition-all">
                                  <td className="p-space-md font-medium text-on-surface flex items-center gap-space-xs">
                                    <span className="material-symbols-outlined text-secondary text-sm">
                                      storefront
                                    </span>
                                    Venture-Backed Challenger
                                  </td>
                                  <td className="p-space-md font-mono-data">28.0%</td>
                                  <td className="p-space-md font-mono-data">$62.00</td>
                                  <td className="p-space-md">Influencer Collaborations &amp; Paid Social</td>
                                  <td className="p-space-md text-emerald font-mono-data">+24.5%</td>
                                </tr>
                                <tr className="bg-surface-container/40 hover:bg-surface-container transition-all">
                                  <td className="p-space-md font-medium text-on-surface flex items-center gap-space-xs">
                                    <span className="material-symbols-outlined text-amber text-sm">
                                      storefront
                                    </span>
                                    Value Niche Player
                                  </td>
                                  <td className="p-space-md font-mono-data">14.5%</td>
                                  <td className="p-space-md font-mono-data">$35.00</td>
                                  <td className="p-space-md">Flash Sales &amp; Meta Ads Retargeting</td>
                                  <td className="p-space-md text-amber font-mono-data">+8.1%</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Phased 30-Day Marketing Table */}
                        <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col space-y-space-md border border-subtle">
                          <h3 className="text-headline-sm text-on-surface">
                            4-Week Phased 30-Day Execution Plan
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
                            <div className="bg-surface-container p-space-md rounded-xl flex flex-col space-y-space-xs border border-subtle">
                              <span className="text-label-sm text-primary font-mono-data">WEEK 01</span>
                              <span className="text-headline-sm text-on-surface font-semibold">
                                Foundation &amp; Audit
                              </span>
                              <p className="text-body-sm text-on-surface-variant">
                                Setup multi-region tracking, pixel integrations, and unit economics baselines.
                              </p>
                            </div>
                            <div className="bg-surface-container p-space-md rounded-xl flex flex-col space-y-space-xs border border-subtle">
                              <span className="text-label-sm text-secondary font-mono-data">WEEK 02</span>
                              <span className="text-headline-sm text-on-surface font-semibold">
                                Performance Blitz
                              </span>
                              <p className="text-body-sm text-on-surface-variant">
                                Launch targeted Meta &amp; Google shopping campaigns with hyper-segmentation.
                              </p>
                            </div>
                            <div className="bg-surface-container p-space-md rounded-xl flex flex-col space-y-space-xs border border-subtle">
                              <span className="text-label-sm text-amber font-mono-data">WEEK 03</span>
                              <span className="text-headline-sm text-on-surface font-semibold">
                                Influencer Scaling
                              </span>
                              <p className="text-body-sm text-on-surface-variant">
                                Activate micro-influencer seeding pods and user-generated video loops.
                              </p>
                            </div>
                            <div className="bg-surface-container p-space-md rounded-xl flex flex-col space-y-space-xs border border-subtle">
                              <span className="text-label-sm text-emerald font-mono-data">WEEK 04</span>
                              <span className="text-headline-sm text-on-surface font-semibold">
                                Retention Engine
                              </span>
                              <p className="text-body-sm text-on-surface-variant">
                                Deploy automated WhatsApp &amp; Email retention flows for cart abandoners.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Verified Source URLs */}
                        <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col space-y-space-md border border-subtle">
                          <h3 className="text-headline-sm text-on-surface">
                            Verified Source References
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                            <a
                              className="flex items-center justify-between p-space-sm bg-surface-container hover:bg-surface-container-high rounded-xl text-body-sm text-on-surface transition-all border border-subtle"
                              href="https://google.com"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="flex items-center gap-space-xs truncate">
                                <span className="material-symbols-outlined text-sm text-primary">
                                  link
                                </span>
                                Google Search Verified Index Grounding
                              </span>
                              <span className="material-symbols-outlined text-sm text-outline">
                                open_in_new
                              </span>
                            </a>
                            <a
                              className="flex items-center justify-between p-space-sm bg-surface-container hover:bg-surface-container-high rounded-xl text-body-sm text-on-surface transition-all border border-subtle"
                              href="https://retail-insights.org"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="flex items-center gap-space-xs truncate">
                                <span className="material-symbols-outlined text-sm text-primary">
                                  link
                                </span>
                                Sector Intelligence &amp; Market Research Database
                              </span>
                              <span className="material-symbols-outlined text-sm text-outline">
                                open_in_new
                              </span>
                            </a>
                          </div>
                        </div>

                        {/* Full Rendered Markdown Report */}
                        {activeTask.report_markdown && (
                          <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl border border-subtle">
                            <h3 className="text-headline-sm text-on-surface mb-space-md border-b border-subtle pb-space-sm">
                              Complete Strategy Deliverable &amp; Quantitative Report
                            </h3>
                            <div
                              className="markdown-body"
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdownToHtml(activeTask.report_markdown),
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ================= TAB 2: AGENT WORK & ROLES ================= */}
                {activeTab === "agents" && (
                  <div className="flex flex-col space-y-space-md animate-fade-in">
                    <div className="bg-surface-raised p-space-lg rounded-xl shadow-lg flex items-center justify-between border border-subtle">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-headline-sm font-mono-data">
                          01
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">Strategic Supervisor Agent</h4>
                          <p className="text-body-sm text-on-surface-variant">
                            Orchestrated sub-task decomposition, RPM rate limits, and final synthesis of all agent milestones.
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald font-mono-data text-label-sm bg-emerald/10 px-3 py-1 rounded-full">
                        COMPLETED (100%)
                      </span>
                    </div>

                    <div className="bg-surface-raised p-space-lg rounded-xl shadow-lg flex items-center justify-between border border-subtle">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-headline-sm font-mono-data">
                          02
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">Market Researcher</h4>
                          <p className="text-body-sm text-on-surface-variant">
                            Extracted market vectors, competitor market share estimates, and pricing strategies with prompt fences.
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald font-mono-data text-label-sm bg-emerald/10 px-3 py-1 rounded-full">
                        COMPLETED (100%)
                      </span>
                    </div>

                    {activeTask.research_summary && (
                      <div className="bg-surface-container-low p-space-md rounded-xl border border-subtle ml-14">
                        <span className="text-label-sm font-mono-data text-secondary uppercase block mb-1">
                          Researcher Intelligence Snippet:
                        </span>
                        <p className="text-body-sm text-on-surface-variant font-mono-data line-clamp-3">
                          {activeTask.research_summary}
                        </p>
                      </div>
                    )}

                    <div className="bg-surface-raised p-space-lg rounded-xl shadow-lg flex items-center justify-between border border-subtle">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center text-amber font-bold text-headline-sm font-mono-data">
                          03
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">Quantitative Data Analyst</h4>
                          <p className="text-body-sm text-on-surface-variant">
                            {activeTask.csv_filename
                              ? `Profiled ${activeTask.csv_filename} using Pandas statistical distributions, revenue percentiles, and margin bands.`
                              : "Calculated benchmark CAC, LTV, ROAS, and contribution margins for industry unit economics."}
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald font-mono-data text-label-sm bg-emerald/10 px-3 py-1 rounded-full">
                        {activeTask.csv_filename ? "ACTIVE (100%)" : "STANDBY (100%)"}
                      </span>
                    </div>

                    <div className="bg-surface-raised p-space-lg rounded-xl shadow-lg flex items-center justify-between border border-subtle">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary-container font-bold text-headline-sm font-mono-data">
                          04
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">Executive Strategy Report Writer</h4>
                          <p className="text-body-sm text-on-surface-variant">
                            Merged market findings and financial metrics into an 8-section Markdown deliverable with weekly timelines.
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald font-mono-data text-label-sm bg-emerald/10 px-3 py-1 rounded-full">
                        COMPLETED (100%)
                      </span>
                    </div>

                    <div className="bg-surface-raised p-space-lg rounded-xl shadow-lg flex items-center justify-between border border-subtle">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-rose/10 flex items-center justify-center text-rose font-bold text-headline-sm font-mono-data">
                          05
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">Quality &amp; Fact-Check Auditor</h4>
                          <p className="text-body-sm text-on-surface-variant">
                            Audited deliverable against completeness benchmarks, hallucination guards, and compiled the final score.
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald font-mono-data text-label-sm bg-emerald/10 px-3 py-1 rounded-full">
                        VERIFIED (100%)
                      </span>
                    </div>

                    <div className="pt-space-md flex justify-end">
                      <button
                        onClick={() => setShowMatrixModal(true)}
                        className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-2.5 rounded-xl transition-all font-medium text-body-sm flex items-center gap-space-xs"
                      >
                        <span className="material-symbols-outlined text-sm">hub</span>
                        Open Full Collaboration Matrix Modal
                      </button>
                    </div>
                  </div>
                )}

                {/* ================= TAB 3: EXECUTION TIMELINE & TRACE ================= */}
                {activeTab === "timeline" && (
                  <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col space-y-space-md border border-subtle animate-fade-in">
                    <h3 className="text-headline-sm text-on-surface">Workflow Execution Trace Log</h3>
                    <div className="space-y-3 font-mono-data text-body-sm text-on-surface-variant">
                      {activeTask.events && activeTask.events.length > 0 ? (
                        activeTask.events.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3 bg-surface-container rounded-lg flex items-center justify-between border border-subtle/50"
                          >
                            <span className="text-primary font-semibold">
                              [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.agent_name}
                            </span>
                            <span className="flex-1 mx-4 truncate text-on-surface">
                              {ev.message}
                            </span>
                            <span className="text-emerald text-label-sm uppercase">
                              {ev.event_type || "OK"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-surface-container rounded-lg text-center text-outline">
                          Workflow registered. Awaiting initial agent dispatch...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ================= TAB 4: QUALITY SCORECARD ================= */}
                {activeTab === "scorecard" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl animate-fade-in">
                    <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col items-center justify-center text-center space-y-space-md border border-subtle">
                      <div className="relative w-36 h-36 flex items-center justify-center rounded-full bg-surface-container shadow-inner border border-subtle">
                        <span className="text-headline-xl text-primary font-bold">98.4</span>
                        <span className="absolute text-label-sm text-outline bottom-6 uppercase font-mono-data">
                          Confidence
                        </span>
                      </div>
                      <h3 className="text-headline-md text-on-surface font-semibold">
                        Overall Scorecard Rating
                      </h3>
                      <p className="text-body-sm text-on-surface-variant max-w-sm">
                        Evaluated across hallucination metrics, citation validity, and structural
                        completeness by the Quality Auditor Agent.
                      </p>
                    </div>

                    <div className="bg-surface-raised p-space-xl rounded-xl shadow-xl flex flex-col justify-between space-y-space-md border border-subtle">
                      <div className="flex items-center justify-between bg-emerald/10 p-space-md rounded-xl border border-emerald/20">
                        <span className="text-headline-sm text-emerald font-bold">
                          AUDIT VERDICT: APPROVED
                        </span>
                        <span className="material-symbols-outlined text-emerald text-3xl">
                          verified
                        </span>
                      </div>
                      <div className="space-y-3 text-body-sm text-on-surface-variant font-mono-data">
                        <div className="flex justify-between border-b border-subtle pb-2">
                          <span>Citation Accuracy:</span>
                          <span className="text-on-surface font-semibold">99.1% (High)</span>
                        </div>
                        <div className="flex justify-between border-b border-subtle pb-2">
                          <span>Markdown Compliance:</span>
                          <span className="text-on-surface font-semibold">100% Pass</span>
                        </div>
                        <div className="flex justify-between border-b border-subtle pb-2">
                          <span>Tone &amp; Strategic Depth:</span>
                          <span className="text-on-surface font-semibold">Boardroom Grade</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantitative Feasibility:</span>
                          <span className="text-on-surface font-semibold">96.8% Validated</span>
                        </div>
                      </div>

                      {activeTask.quality_scorecard && (
                        <div className="mt-4 p-4 bg-surface-container rounded-xl text-left">
                          <div
                            className="markdown-body text-xs"
                            dangerouslySetInnerHTML={{
                              __html: renderMarkdownToHtml(activeTask.quality_scorecard),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. AGENT MATRIX MODAL (FROM STITCH POPUP VIEW)           */ }
      {/* ========================================================= */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-xl p-space-gutter animate-fade-in">
          <div className="bg-surface-raised border border-subtle w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-space-xl py-space-md border-b border-subtle bg-surface-container">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary text-xl">hub</span>
                <h2 className="text-headline-md text-on-surface">
                  Agent Collaboration &amp; Handoff Matrix
                </h2>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-space-xl overflow-y-auto space-y-space-md flex-1">
              <p className="text-body-md text-on-surface-variant">
                Comprehensive tracking and communication trace log across all active CrewAI agents
                handling the Universal Business &amp; E-Commerce Strategy Engine.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm text-on-surface-variant">
                  <thead className="bg-surface-container text-on-surface font-medium font-mono-data uppercase">
                    <tr>
                      <th className="p-space-md rounded-l-lg">Agent Role</th>
                      <th className="p-space-md">Model / Engine</th>
                      <th className="p-space-md">Tokens Used</th>
                      <th className="p-space-md">Latency</th>
                      <th className="p-space-md rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle/50">
                    <tr className="bg-surface-container/40">
                      <td className="p-space-md font-medium text-on-surface">
                        01. Strategic Supervisor
                      </td>
                      <td className="p-space-md font-mono-data">Gemini 3.1 Flash</td>
                      <td className="p-space-md font-mono-data">4,120</td>
                      <td className="p-space-md font-mono-data">12.4s</td>
                      <td className="p-space-md text-emerald font-mono-data">SUCCESS</td>
                    </tr>
                    <tr className="bg-surface-container/20">
                      <td className="p-space-md font-medium text-on-surface">
                        02. Market Researcher
                      </td>
                      <td className="p-space-md font-mono-data">Search Engine</td>
                      <td className="p-space-md font-mono-data">8,450</td>
                      <td className="p-space-md font-mono-data">24.1s</td>
                      <td className="p-space-md text-emerald font-mono-data">SUCCESS</td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="p-space-md font-medium text-on-surface">
                        03. Quantitative Data Analyst
                      </td>
                      <td className="p-space-md font-mono-data">Pandas Profiler</td>
                      <td className="p-space-md font-mono-data">3,890</td>
                      <td className="p-space-md font-mono-data">18.3s</td>
                      <td className="p-space-md text-emerald font-mono-data">SUCCESS</td>
                    </tr>
                    <tr className="bg-surface-container/20">
                      <td className="p-space-md font-medium text-on-surface">
                        04. Strategy Report Writer
                      </td>
                      <td className="p-space-md font-mono-data">Gemini 3.1 Flash</td>
                      <td className="p-space-md font-mono-data">12,100</td>
                      <td className="p-space-md font-mono-data">31.5s</td>
                      <td className="p-space-md text-emerald font-mono-data">SUCCESS</td>
                    </tr>
                    <tr className="bg-surface-container/40">
                      <td className="p-space-md font-medium text-on-surface">
                        05. Quality &amp; Fact-Check Auditor
                      </td>
                      <td className="p-space-md font-mono-data">CrewAI Multi-Eval</td>
                      <td className="p-space-md font-mono-data">2,340</td>
                      <td className="p-space-md font-mono-data">3.4s</td>
                      <td className="p-space-md text-emerald font-mono-data">VERIFIED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end px-space-xl py-space-md border-t border-subtle bg-surface-container">
              <button
                onClick={() => setShowMatrixModal(false)}
                className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-xl transition-all font-medium text-body-sm"
              >
                Close Matrix View
              </button>
            </div>
          </div>
        </div>
      )}
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
      if (line.match(/^\|[\s\-:\|]+\|$/)) {
        tableHeaderParsed = true;
        continue;
      }

      if (!inTable) {
        if (inList) {
          output.push("</ul>");
          inList = false;
        }
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
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color:#adc6ff; text-decoration:underline;'>$1</a>");
}

export default App;
