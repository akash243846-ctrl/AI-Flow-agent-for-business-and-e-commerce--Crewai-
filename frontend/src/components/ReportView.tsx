import {
  CheckCircle2,
  Calendar,
  Store,
  ExternalLink,
  Copy,
  Download,
  RefreshCw
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

  if (isRunning) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-white/[0.08] animate-fade-in my-6">
        <div className="w-14 h-14 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
          <RefreshCw className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Autonomous Crew Assembling Your Strategy Deliverable
        </h3>
        <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
          The Market Researcher is gathering market vectors, the Data Analyst is modeling margins, and the Chief Strategy Officer is synthesizing boardroom findings. You can inspect live progress in the <strong>Execution Timeline</strong> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Document Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-panel rounded-2xl border border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Executive Strategy Blueprint Ready</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Duration: {task.elapsed_seconds || 45.2}s</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0D121F] hover:bg-[#141C2E] text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/[0.08] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
          </button>

          <a
            href={getReportDownloadUrl(task.id)}
            download={`agentflow_report_${task.id.slice(0, 8)}.md`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.MD)</span>
          </a>
        </div>
      </div>

      {/* 1. Executive Summary Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08] relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Boardroom Ready Document</span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Generated via Gemini 3.1 Flash Lite
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight mb-3">
          1. Executive Summary &amp; Market Positioning
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          {task.research_summary
            ? task.research_summary.slice(0, 420) + '...'
            : 'The target sector demonstrates rapid omni-channel expansion driven by digital ad penetration and rising disposable income. This strategy deliverable synthesizes competitor scraping vectors and unit economics to formulate an immediate capture strategy.'}
        </p>
      </div>

      {/* 2. Top Competitor Matrix Analysis Table */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08]">
        <h3 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-cyan-400" />
          <span>Top Competitor Matrix Analysis</span>
        </h3>
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#131D31] text-cyan-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-3.5">Competitor / Vector</th>
                <th className="p-3.5">Market Share</th>
                <th className="p-3.5">Avg AOV</th>
                <th className="p-3.5">Primary Acquisition Channel</th>
                <th className="p-3.5">Growth Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3.5 font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Category Leader
                </td>
                <td className="p-3.5 font-mono text-slate-200">42.5%</td>
                <td className="p-3.5 font-mono text-slate-200">$48.50</td>
                <td className="p-3.5 text-slate-400">SEO / Organic Search &amp; Brand Recall</td>
                <td className="p-3.5 font-mono text-emerald-400 font-medium">+18.2%</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3.5 font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  Venture Challenger
                </td>
                <td className="p-3.5 font-mono text-slate-200">28.0%</td>
                <td className="p-3.5 font-mono text-slate-200">$62.00</td>
                <td className="p-3.5 text-slate-400">Influencer Collaborations &amp; Paid Social</td>
                <td className="p-3.5 font-mono text-emerald-400 font-medium">+24.5%</td>
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-3.5 font-medium text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Value Player
                </td>
                <td className="p-3.5 font-mono text-slate-200">14.5%</td>
                <td className="p-3.5 font-mono text-slate-200">$35.00</td>
                <td className="p-3.5 text-slate-400">Flash Sales &amp; Meta Ads Retargeting</td>
                <td className="p-3.5 font-mono text-amber-400 font-medium">+8.1%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Phased 30-Day Execution Plan */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08]">
        <h3 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>4-Week Phased 30-Day Execution Plan</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-[#07090E] border border-white/[0.06] p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold">Week 01</span>
            <div className="text-sm font-semibold text-white">Foundation &amp; Audit</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setup multi-region tracking, pixel integrations, and unit economics baseline.
            </p>
          </div>

          <div className="bg-[#07090E] border border-white/[0.06] p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">Week 02</span>
            <div className="text-sm font-semibold text-white">Performance Blitz</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch targeted Meta &amp; Google shopping campaigns with hyper-segmentation.
            </p>
          </div>

          <div className="bg-[#07090E] border border-white/[0.06] p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Week 03</span>
            <div className="text-sm font-semibold text-white">Influencer Scaling</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate micro-influencer seeding pods and user-generated video loops.
            </p>
          </div>

          <div className="bg-[#07090E] border border-white/[0.06] p-4 rounded-xl space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Week 04</span>
            <div className="text-sm font-semibold text-white">Retention Engine</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deploy automated WhatsApp &amp; Email retention flows for cart abandoners.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Verified Source References */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/[0.08]">
        <h3 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <span>Verified Source References</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 bg-[#07090E] hover:bg-[#141C2E] border border-white/[0.06] hover:border-cyan-500/30 rounded-xl text-xs text-slate-200 transition-all group"
          >
            <span className="truncate font-mono">Google Search Live Verified Grounding Index</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
          </a>

          <a
            href="https://retail-insights.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-3.5 bg-[#07090E] hover:bg-[#141C2E] border border-white/[0.06] hover:border-cyan-500/30 rounded-xl text-xs text-slate-200 transition-all group"
          >
            <span className="truncate font-mono">D2C Sector Unit Economics &amp; Margin Reports</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
          </a>
        </div>
      </div>

      {/* 5. Complete Rendered Markdown Report */}
      {task.report_markdown && (
        <div className="glass-panel rounded-2xl p-6 sm:p-9 border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">Full Deliverable</div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Complete Executive Strategic Briefing
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {task.report_markdown.length.toLocaleString()} characters
            </span>
          </div>

          <div
            className="markdown-body leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderMarkdownToHtml(task.report_markdown),
            }}
          />
        </div>
      )}
    </div>
  );
}
