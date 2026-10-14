import { 
  Sparkles, 
  RefreshCw, 
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
    <header className="sticky top-0 z-30 h-16 bg-gradient-to-r from-[#12163b]/95 via-[#1a1444]/95 to-[#101b3d]/95 backdrop-blur-2xl border-b border-cyan-400/40 shadow-[0_4px_25px_rgba(0,240,255,0.2)] px-4 sm:px-6 flex items-center justify-between transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70 animate-pulse-glow" />

      {/* Left: Sidebar Maximize/Minimize Toggle & Brand Pill */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/40 flex items-center gap-2 transition-all active:scale-95 group shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.25)]"
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
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 font-bold shrink-0 animate-pulse-glow">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                AgentFlow AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/15 to-fuchsia-500/15 text-cyan-300 border border-cyan-400/30 uppercase shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Live Swarm v3.4
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block h-4 w-[1px] bg-white/10 mx-1" />

        {/* Gemini Active Model Badge with Neon Spark */}
        <div className="hidden md:flex items-center gap-2 bg-[#0D121F]/90 px-3 py-1.5 rounded-full border border-cyan-500/25 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-xs font-mono font-medium text-cyan-200">
            {health?.gemini_model || 'gemini/gemini-3.1-flash-lite'}
          </span>
        </div>
      </div>

      {/* Right: Actions, Animated Sticker Chip & Health Indicator */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Animated Crew Sticker Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-400/50 shadow-[0_0_18px_rgba(99,102,241,0.35),inset_0_0_10px_rgba(99,102,241,0.15)]">
          <span className="text-sm">🤖</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-indigo-300">CrewAI Engine</span>
            <span className="text-[9px] font-mono text-slate-400">5 Agents Orchestrated</span>
          </div>
        </div>

        {/* Dynamic Real Backend Health Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all ${
            isHealthy
              ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
          title={isHealthy ? 'Connected to FastAPI Backend (Uvicorn 127.0.0.1:8000)' : 'Backend Offline'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isHealthy ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-400 animate-pulse'
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
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30 transition-all disabled:opacity-50"
          title="Refresh Engine State"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Export Report (Active Workflow) - Markdown Report Only */}
        {activeTask && activeTask.report_markdown && (
          <a
            href={getReportDownloadUrl(activeTask.id)}
            download={`AgentFlow_Report_${activeTask.id.slice(0, 8)}.md`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-200 border border-cyan-400/40 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            title="Download verified markdown strategy report"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden md:inline font-semibold">Export Strategy (.md)</span>
          </a>
        )}
      </div>
    </header>
  );
}
