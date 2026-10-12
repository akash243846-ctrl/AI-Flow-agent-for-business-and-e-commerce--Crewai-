import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  PanelLeftClose,
  PanelLeftOpen,
  FileText
} from 'lucide-react';
import type { SystemHealth, Task } from '../types';
import { getReportDownloadUrl } from '../api';

interface HeaderProps {
  health: SystemHealth | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  activeTask: Task | null;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  health,
  onRefresh,
  isRefreshing,
  activeTask,
  isSidebarCollapsed,
  onToggleSidebar
}: HeaderProps) {
  const isHealthy = Boolean(health);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Sidebar Maximize/Minimize Toggle & Brand Pill */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] flex items-center gap-2 transition-all active:scale-95 group shadow-sm"
          title={isSidebarCollapsed ? "Maximize Recent Workflows (Show)" : "Minimize Recent Workflows (Hide)"}
          aria-label={isSidebarCollapsed ? "Maximize Recent Workflows" : "Minimize Recent Workflows"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          )}
          <span className="hidden sm:inline text-xs font-semibold text-slate-300">
            {isSidebarCollapsed ? "Show Workflows" : "Hide Workflows"}
          </span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">AgentFlow AI</span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                Mission Control v3.4
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-4 w-[1px] bg-white/10 mx-1" />

        {/* Gemini Active Model Badge */}
        <div className="hidden md:flex items-center gap-2 bg-[#0D121F] px-3 py-1.5 rounded-full border border-white/[0.06] shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-xs font-mono text-slate-300">
            {health?.gemini_model || 'gemini/gemini-3.1-flash-lite'}
          </span>
        </div>
      </div>

      {/* Right: Actions & Real Connection Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Real Backend Health Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all ${
            isHealthy
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
          title={isHealthy ? 'Connected to FastAPI Backend (Uvicorn 127.0.0.1:8000)' : 'Backend Offline'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400 animate-pulse'
            }`}
          />
          <span className="font-mono text-[11px] hidden sm:inline">
            {isHealthy ? 'System Online' : 'Offline'}
          </span>
        </div>

        {/* Refresh / Reconnect Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-all disabled:opacity-50"
          title="Refresh Engine State"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Download Project ZIP */}
        <a
          href="http://127.0.0.1:8000/api/download-project-zip"
          download="agentflow-ai.zip"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all hover:border-white/20"
          title="Download complete project codebase archive"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Project ZIP</span>
        </a>

        {/* Export Report (Active Workflow) */}
        {activeTask && activeTask.report_markdown && (
          <a
            href={getReportDownloadUrl(activeTask.id)}
            download={`AgentFlow_Report_${activeTask.id.slice(0, 8)}.md`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all shadow-sm shadow-cyan-500/10"
            title="Download verified markdown strategy report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export Report</span>
          </a>
        )}
      </div>
    </header>
  );
}
