import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  Menu,
  FileText
} from 'lucide-react';
import type { SystemHealth, Task } from '../types';
import { getReportDownloadUrl } from '../api';

interface HeaderProps {
  health: SystemHealth | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
  activeTask: Task | null;
  onToggleMobileSidebar: () => void;
}

export function Header({
  health,
  onRefresh,
  isRefreshing,
  activeTask,
  onToggleMobileSidebar
}: HeaderProps) {
  const isHealthy = Boolean(health);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Brand Pill */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-bold">
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
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
            isHealthy
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span className="hidden sm:inline">{isHealthy ? 'System Online' : 'Connecting...'}</span>
          <span className="sm:hidden">{isHealthy ? 'Live' : 'Off'}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-white bg-[#0D121F] hover:bg-[#141C2E] border border-white/[0.08] rounded-xl transition-all shadow-sm"
          title="Refresh Workspace"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Download Clean Project Zip */}
        <a
          href="http://127.0.0.1:8000/api/download-project-zip"
          download="agentflow-ai.zip"
          className="hidden sm:flex items-center gap-2 bg-[#0D121F] hover:bg-[#141C2E] text-slate-200 hover:text-white border border-white/[0.08] px-3.5 py-2 rounded-xl text-xs font-medium transition-all shadow-sm group"
          title="Download Production Deployment Archive"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          <span>Project ZIP</span>
        </a>

        {/* Export Report Markdown */}
        {activeTask?.report_markdown && (
          <a
            href={getReportDownloadUrl(activeTask.id)}
            download={`agentflow_${activeTask.id.slice(0, 8)}.md`}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </a>
        )}
      </div>
    </header>
  );
}
