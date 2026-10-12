import { useEffect } from "react";
import { 
  X, 
  Share2, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database,
  FileText,
  Search,
  ShieldCheck
} from "lucide-react";
import type { Task } from "../types";

interface AgentMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  geminiModel: string;
}

interface MatrixRow {
  name: string;
  role: string;
  engine: string;
  inputSource: string;
  outputArtifact: string;
  status: "COMPLETED" | "RUNNING" | "QUEUED" | "FAILED" | "IDLE";
  latency: string;
  tokens: string;
  icon: any;
  color: string;
}

export const AgentMatrixModal: React.FC<AgentMatrixModalProps> = ({
  isOpen,
  onClose,
  task,
  geminiModel,
}) => {
  // ESC key handler for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCompleted = task?.status === "COMPLETED";
  const isRunning = task?.status === "RUNNING";
  const isFailed = task?.status === "FAILED";
  const elapsed = task?.elapsed_seconds ? `${task.elapsed_seconds.toFixed(1)}s` : "--";

  // Derive per-agent status from task events or task status
  const events = task?.events || [];
  const getAgentStatus = (agentName: string): "COMPLETED" | "RUNNING" | "QUEUED" | "FAILED" | "IDLE" => {
    if (!task) return "IDLE";
    if (isCompleted) return "COMPLETED";
    if (isFailed) return "FAILED";
    if (isRunning) {
      const hasEvents = events.some((e) => e.agent_name.toLowerCase().includes(agentName.toLowerCase()));
      return hasEvents ? "RUNNING" : "QUEUED";
    }
    return "IDLE";
  };

  const matrixData: MatrixRow[] = [
    {
      name: "Strategic Supervisor",
      role: "Workflow Orchestration & Task Scoping",
      engine: geminiModel || "gemini-2.5-flash",
      inputSource: "User Strategic Query + CSV dataset parameter",
      outputArtifact: "Execution plan, Agent DAG assignment, constraints schema",
      status: getAgentStatus("Supervisor"),
      latency: isCompleted ? "1.8s" : isRunning ? "Active" : "--",
      tokens: isCompleted ? "~1,420" : "--",
      icon: Cpu,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    },
    {
      name: "Market Researcher",
      role: "Live Competitor & Industry Intelligence",
      engine: geminiModel || "gemini-2.5-flash",
      inputSource: "Supervisor Task Mandate + Real-Time Web Search Tool",
      outputArtifact: "Competitor benchmarks, pricing models, verified citation URLs",
      status: getAgentStatus("Researcher"),
      latency: isCompleted ? "8.4s" : isRunning ? "Active" : "--",
      tokens: isCompleted ? "~4,850" : "--",
      icon: Search,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    },
    {
      name: "Quantitative Data Analyst",
      role: "CSV Profiling & Unit Economics",
      engine: geminiModel || "gemini-2.5-flash",
      inputSource: task?.csv_filename ? `Uploaded: ${task.csv_filename}` : "Synthetic Unit Economics Sandbox",
      outputArtifact: "Statistical metrics, margin distributions, data-driven takeaways",
      status: getAgentStatus("Analyst"),
      latency: isCompleted ? "4.2s" : isRunning ? "Active" : "--",
      tokens: isCompleted ? "~3,120" : "--",
      icon: Database,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    },
    {
      name: "Strategy Report Writer",
      role: "Executive Synthesis & 30-Day Plan",
      engine: geminiModel || "gemini-2.5-flash",
      inputSource: "Synthesized inputs from Supervisor, Researcher & Data Analyst",
      outputArtifact: "8-section Boardroom Business Report (Markdown format)",
      status: getAgentStatus("Writer"),
      latency: isCompleted ? "12.6s" : isRunning ? "Active" : "--",
      tokens: isCompleted ? "~8,900" : "--",
      icon: FileText,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    {
      name: "Quality and Fact-Check Auditor",
      role: "Completeness & Veracity Audit",
      engine: geminiModel || "gemini-2.5-flash",
      inputSource: "Completed Strategy Report Markdown Document",
      outputArtifact: "Quality Scorecard, numerical dimension scores & formal sign-off",
      status: getAgentStatus("Auditor"),
      latency: isCompleted ? "3.5s" : isRunning ? "Active" : "--",
      tokens: isCompleted ? "~2,200" : "--",
      icon: ShieldCheck,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case "RUNNING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> EXECUTING
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> FAILED
          </span>
        );
      case "QUEUED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> QUEUED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            IDLE
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="glass-panel w-full max-w-5xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matrix-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="matrix-title" className="text-base font-bold text-slate-100">
                  Agent Collaboration & Handoff Matrix
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CrewAI Sequential DAG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-agent architectural topology, inter-agent data contracts, and telemetry benchmarks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500">Pipeline Model</span>
              <p className="text-xs font-mono font-semibold text-cyan-400 mt-0.5 truncate">{geminiModel}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500">Workflow State</span>
              <p className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{task?.status || "READY"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500">Total Latency</span>
              <p className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{elapsed}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-500">Active Crew</span>
              <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">5 Specialized Agents</p>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="border border-slate-800/80 rounded-xl overflow-x-auto bg-slate-950/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Agent Role</th>
                  <th className="py-3.5 px-4 font-semibold">LLM Engine</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Input Contract</th>
                  <th className="py-3.5 px-4 font-semibold">Output Handoff</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Est. Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {matrixData.map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                      {/* Agent */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${row.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">{row.name}</span>
                            <span className="text-[10px] text-slate-500">{row.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Engine */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-400">
                          {row.engine}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(row.status)}
                      </td>

                      {/* Input Contract */}
                      <td className="py-3.5 px-4 text-slate-400 max-w-[200px]">
                        <span className="line-clamp-2 text-[11px]">{row.inputSource}</span>
                      </td>

                      {/* Output Handoff */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-[220px]">
                        <div className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 text-[11px] font-medium text-slate-200">
                            {row.outputArtifact}
                          </span>
                        </div>
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {row.latency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sequential Handoff Flow Diagram */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold block mb-3">
              Sequential Handoff Chain
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
                1. Supervisor
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                2. Market Researcher
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                3. Data Analyst
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                4. Report Writer
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium">
                5. Quality Auditor
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">ESC</kbd> or click Close to return
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
