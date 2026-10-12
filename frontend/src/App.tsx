import React, { useState, useEffect, useCallback } from "react";
import type { Task, SystemHealth } from "./types";
import {
  fetchHealth,
  fetchTasks,
  fetchTaskDetail,
  submitNewTask,
  deleteTask,
} from "./api";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MetricsOverview } from "./components/MetricsOverview";
import { StudioWorkspace } from "./components/StudioWorkspace";
import { AgentPipeline } from "./components/AgentPipeline";
import { ReportView } from "./components/ReportView";
import { TimelineView } from "./components/TimelineView";
import { ScorecardView } from "./components/ScorecardView";
import { AgentMatrixModal } from "./components/AgentMatrixModal";
import { Toast, type ToastMessage } from "./components/Toast";
import { 
  FileText, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  Share2
} from "lucide-react";
import "./App.css";

export function App() {
  // Global Application State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<"studio" | "report" | "pipeline" | "timeline" | "scorecard">("report");
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Studio Form State
  const [queryInput, setQueryInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionSpeed, setExecutionSpeed] = useState("balanced");
  const [targetRegion, setTargetRegion] = useState("India (D2C / Quick-Comm)");
  const [outputDeliverable, setOutputDeliverable] = useState("Executive Strategy & 30-Day Plan");
  const [copiedReport, setCopiedReport] = useState(false);

  // Toast Helper
  const triggerToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({
      id: Date.now().toString(),
      message,
      type,
    });
  }, []);

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [healthData, tasksData] = await Promise.allSettled([
        fetchHealth(),
        fetchTasks(),
      ]);

      if (healthData.status === "fulfilled") {
        setHealth(healthData.value);
      } else {
        setHealth(null);
      }

      if (tasksData.status === "fulfilled") {
        const loadedTasks = tasksData.value;
        setTasks(loadedTasks);
        if (loadedTasks.length > 0 && !activeTaskId) {
          // Select most recent task
          const latest = loadedTasks[0];
          setActiveTaskId(latest.id);
          setActiveTask(latest);
          if (latest.status === "COMPLETED") {
            setActiveTab("report");
          } else if (latest.status === "RUNNING" || latest.status === "QUEUED") {
            setActiveTab("pipeline");
          }
        } else if (loadedTasks.length === 0) {
          setIsCreatingNew(true);
          setActiveTab("studio");
        }
      }
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTaskId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Periodic Health Polling (Every 15s)
  useEffect(() => {
    const healthInterval = setInterval(async () => {
      try {
        const h = await fetchHealth();
        setHealth(h);
      } catch {
        setHealth(null);
      }
    }, 15000);
    return () => clearInterval(healthInterval);
  }, []);

  // Poll Active Task if RUNNING or QUEUED
  useEffect(() => {
    if (!activeTaskId) return;

    const shouldPoll = activeTask?.status === "RUNNING" || activeTask?.status === "QUEUED";
    if (!shouldPoll) return;

    const pollInterval = setInterval(async () => {
      try {
        const updated = await fetchTaskDetail(activeTaskId);
        setActiveTask(updated);

        // Update in task list
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

        // If newly finished
        if (updated.status === "COMPLETED") {
          triggerToast("Workflow completed successfully! Executive Report generated.", "success");
          setActiveTab("report");
        } else if (updated.status === "FAILED") {
          triggerToast("Workflow encountered an execution error. Inspect trace logs.", "error");
        }
      } catch (err) {
        console.error("Polling task detail error:", err);
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [activeTaskId, activeTask?.status, triggerToast]);

  // Handlers
  const handleSelectTask = async (taskId: string) => {
    try {
      setIsCreatingNew(false);
      setActiveTaskId(taskId);
      const detail = await fetchTaskDetail(taskId);
      setActiveTask(detail);
      if (detail.status === "COMPLETED") {
        setActiveTab("report");
      } else {
        setActiveTab("pipeline");
      }
    } catch (err) {
      triggerToast("Failed to load task details", "error");
    }
  };

  const handleStartNew = () => {
    setIsCreatingNew(true);
    setActiveTab("studio");
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      const remaining = tasks.filter((t) => t.id !== taskId);
      setTasks(remaining);
      triggerToast("Workflow successfully removed", "success");

      if (activeTaskId === taskId) {
        if (remaining.length > 0) {
          handleSelectTask(remaining[0].id);
        } else {
          setActiveTaskId(null);
          setActiveTask(null);
          setIsCreatingNew(true);
          setActiveTab("studio");
        }
      }
    } catch (err) {
      triggerToast("Failed to delete workflow from history", "error");
    }
  };

  const handleLaunchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) {
      triggerToast("Please provide a strategic objective or select a preset.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdTask = await submitNewTask(queryInput.trim(), selectedFile);
      setTasks((prev) => [createdTask, ...prev]);
      setActiveTaskId(createdTask.id);
      setActiveTask(createdTask);
      setIsCreatingNew(false);
      setActiveTab("pipeline");
      setQueryInput("");
      setSelectedFile(null);
      triggerToast("Autonomous Multi-Agent Crew initiated!", "success");
    } catch (err: any) {
      triggerToast(err.message || "Failed to initiate workflow execution", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnhancePrompt = () => {
    if (!queryInput.trim()) {
      triggerToast("Type an initial objective first before enhancing.", "info");
      return;
    }
    const enhanced = `${queryInput.trim()} Include explicit unit economics (AOV, CAC, Gross Margin, RTO rates), 3-4 real competitor benchmarks with current pricing tiers, and a detailed 30-day phased execution roadmap with weekly milestones.`;
    setQueryInput(enhanced);
    triggerToast("Objective enriched with enterprise strategy parameters", "success");
  };

  const handleCopyReport = () => {
    if (!activeTask?.report_markdown) return;
    navigator.clipboard.writeText(activeTask.report_markdown);
    setCopiedReport(true);
    triggerToast("Strategy Report copied to clipboard in Markdown format", "success");
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Top Main Navigation Header */}
      <Header
        health={health}
        onRefresh={loadInitialData}
        isRefreshing={isRefreshing}
        activeTask={activeTask}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          tasks={tasks}
          selectedTaskId={activeTaskId}
          isCreatingNew={isCreatingNew}
          onSelectTask={handleSelectTask}
          onStartNew={handleStartNew}
          onDeleteTask={handleDeleteTask}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          searchFilter={searchFilter}
          onSearchChange={setSearchFilter}
        />

        {/* Main Workspace Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Ambient Lighting & Tech Grid Overlay */}
          <div className="fixed inset-0 tech-grid-overlay pointer-events-none -z-10" />
          <div className="fixed top-1/4 left-1/3 w-[500px] h-[500px] ambient-radial-glow pointer-events-none -z-10" />

          {/* Section 1: Dynamic Metrics Overview Cards */}
          <MetricsOverview tasks={tasks} />

          {/* Section 2: Studio or Workspace Tabs */}
          {isCreatingNew ? (
            <StudioWorkspace
              queryInput={queryInput}
              setQueryInput={setQueryInput}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isSubmitting={isSubmitting}
              executionSpeed={executionSpeed}
              setExecutionSpeed={setExecutionSpeed}
              targetRegion={targetRegion}
              setTargetRegion={setTargetRegion}
              outputDeliverable={outputDeliverable}
              setOutputDeliverable={setOutputDeliverable}
              onLaunch={handleLaunchWorkflow}
              onEnhance={handleEnhancePrompt}
              hasActiveTask={Boolean(activeTask)}
              onBackToDeliverable={() => {
                setIsCreatingNew(false);
                if (activeTask?.status === "COMPLETED") {
                  setActiveTab("report");
                } else {
                  setActiveTab("pipeline");
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Studio Tab Navigation Bar */}
              <div className="glass-panel p-2 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-white/[0.08]">
                {/* Left: Tab Switchers */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("report")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      activeTab === "report"
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Executive Strategy Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("pipeline")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      activeTab === "pipeline"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Agent Work & Roles</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      activeTab === "timeline"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Execution Timeline & Trace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("scorecard")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      activeTab === "scorecard"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quality Scorecard</span>
                  </button>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-1">
                  <button
                    type="button"
                    onClick={() => setIsMatrixOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
                    title="Inspect 5-Agent Handoff Matrix"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden md:inline">Collaboration Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Workflow</span>
                  </button>
                </div>
              </div>

              {/* Active Tab View Body */}
              {activeTask ? (
                <>
                  {activeTab === "report" && (
                    <ReportView
                      task={activeTask}
                      renderMarkdownToHtml={renderMarkdownToHtml}
                      onCopyReport={handleCopyReport}
                      copiedReport={copiedReport}
                    />
                  )}

                  {activeTab === "pipeline" && (
                    <AgentPipeline
                      task={activeTask}
                      onOpenMatrixModal={() => setIsMatrixOpen(true)}
                    />
                  )}

                  {activeTab === "timeline" && (
                    <TimelineView
                      task={activeTask}
                      onToast={triggerToast}
                    />
                  )}

                  {activeTab === "scorecard" && (
                    <ScorecardView task={activeTask} />
                  )}
                </>
              ) : (
                <div className="glass-panel p-16 text-center rounded-2xl border border-white/[0.08]">
                  <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-base font-bold text-white mb-1">No Active Workflow Selected</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    Select an existing execution from the left sidebar or launch a new autonomous crew run.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Launch New Workflow</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Agent Collaboration & Handoff Matrix Modal */}
      <AgentMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        task={activeTask}
        geminiModel={health?.gemini_model || "gemini-2.5-flash"}
      />
    </div>
  );
}

// Markdown to HTML Parser for Executive Reports
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

    // Table Row detection
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

    // List item detection
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
    .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color:#38bdf8; text-decoration:underline;'>$1</a>");
}

export default App;
