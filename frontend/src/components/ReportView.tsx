import { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Store,
  ExternalLink,
  Copy,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Share2,
  Check
} from 'lucide-react';
import type { Task } from '../types';
import { getReportDownloadUrl } from '../api';

interface ReportViewProps {
  task: Task;
  renderMarkdownToHtml: (md: string) => string;
  onCopyReport: () => void;
  copiedReport: boolean;
}

export function ReportView({
  task,
  renderMarkdownToHtml,
  onCopyReport,
  copiedReport,
}: ReportViewProps) {
  const isRunning = task.status === 'RUNNING' || task.status === 'QUEUED';
  const [activeSection, setActiveSection] = useState<string>('all');

  const reportSections = [
    { id: 'sec-summary', label: '1. Executive Summary', icon: Sparkles },
    { id: 'sec-collab', label: '2. Multi-Agent Transparency', icon: Share2 },
    { id: 'sec-market', label: '3. Market Landscape & Drivers', icon: TrendingUp },
    { id: 'sec-competitors', label: '4. Competitor Benchmark Matrix', icon: Store },
    { id: 'sec-economics', label: '5. Unit Economics Architecture', icon: Calendar },
    { id: 'sec-roadmap', label: '6. 30-Day Phased Roadmap', icon: Calendar },
    { id: 'sec-risks', label: '7. Risks & Mitigation Matrix', icon: ShieldCheck },
    { id: 'sec-sources', label: '8. Verified Citations', icon: ExternalLink },
  ];

  if (isRunning) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-white/[0.08] animate-fade-in my-6">
        <div className="w-14 h-14 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-on-surface tracking-tight">
          Autonomous Crew Assembling Your Strategy Deliverable
        </h3>
        <p className="text-xs text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          The Market Researcher is crawling market intelligence, the Data Analyst is modeling unit economics, and the Chief Strategy Officer is synthesizing boardroom findings. Inspect live stream in the <strong>Execution Timeline</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Document Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-panel rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                Verified Boardroom Deliverable
              </span>
              <span className="text-outline text-xs">?</span>
              <span className="text-xs text-on-surface-variant font-mono">
                {task.elapsed_seconds ? `${task.elapsed_seconds.toFixed(0)}s execution` : 'Synthesized'}
              </span>
            </div>
            <h2 className="text-base font-bold text-on-surface mt-0.5">
              Strategic Executive Report
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-container-high hover:bg-surface-bright text-on-surface border border-white/[0.08] transition-all"
            title="Copy entire markdown deliverable"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Copied' : 'Copy Markdown'}</span>
          </button>

          <a
            href={getReportDownloadUrl(task.id)}
            download={`AgentFlow_Report_${task.id.slice(0, 8)}.md`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-fixed hover:opacity-90 shadow-md shadow-primary-container/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.md)</span>
          </a>
        </div>
      </div>

      {/* Split Layout: Table of Contents (Left) & Document Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Table of Contents & Quick Metadata (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-outline font-semibold">
                Report Structure
              </span>
              <span className="text-[10px] font-mono text-surface-tint">8 Sections</span>
            </div>

            <nav className="space-y-1">
              {reportSections.map((sec, idx) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                      activeSection === sec.id
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    <span className="text-[10px] opacity-60 font-mono">0{idx + 1}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Context Card */}
          <div className="p-4 rounded-xl bg-surface-container/70 border border-white/[0.08] text-xs space-y-2">
            <span className="text-[10px] font-mono uppercase text-outline">Evaluated Objective</span>
            <p className="text-on-surface text-[11px] leading-relaxed line-clamp-4">
              "{task.query}"
            </p>
            {task.csv_filename && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-surface-tint">
                <span>Dataset Attached:</span>
                <span className="truncate max-w-[140px]">{task.csv_filename}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reading Document (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Markdown Body Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/[0.08] text-on-surface">
            {task.report_markdown ? (
              <div
                className="markdown-body text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownToHtml(task.report_markdown),
                }}
              />
            ) : (
              <div className="py-12 text-center text-outline text-xs">
                Report content is currently being synthesized by the Strategy Report Writer...
              </div>
            )}
          </div>

          {/* Verified Sources & References Section */}
          <div className="glass-panel p-6 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-4 h-4 text-primary-container" />
              <h4 className="text-sm font-semibold text-on-surface">
                Autonomous Verification &amp; Market Evidence
              </h4>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Synthesized by the Market Researcher and audited by the Quality Auditor against real-time industry sources, live search benchmarks, and financial viability parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
